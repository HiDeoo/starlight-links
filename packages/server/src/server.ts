import { deserializeLspOptions, type StarlightLinksLspOptions } from 'starlight-links-shared/lsp.js'
import {
  createConnection,
  ProposedFeatures,
  TextDocumentSyncKind,
  type InitializeResult,
  TextDocuments,
  CompletionItemKind,
  type InitializeParams,
  type CompletionParams,
  type CompletionItem,
} from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'

import { endsWithLinkUrl } from './libs/markdown'
import { getLinksData, type LinksData } from './libs/starlight'

const connection = createConnection(ProposedFeatures.all)
const documents = new TextDocuments(TextDocument)

let lspOptions: StarlightLinksLspOptions | undefined
let linksData: LinksData = new Map()

runLsp()

function runLsp() {
  connection.onInitialize(onConnectionInitialize)
  connection.onCompletion(onConnectionCompletion)

  // TODO(HiDeoo) onConfigChange

  documents.onDidChangeContent(() => {
    connection.console.log('🚨 [server.ts:53] change.document:')
  })

  connection.onDidChangeWatchedFiles((_change) => {
    // Monitored files have change in VSCode
    connection.console.log('We received a file change event')
  })

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  connection.languages.diagnostics.on(() => {
    connection.console.log('🚨 [server.ts:53] diagnostics')
  })

  documents.listen(connection)
  connection.listen()
}

function onConnectionInitialize({ initializationOptions }: InitializeParams) {
  // const capabilities = params.capabilities

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  // hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration)
  // hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders)
  // hasDiagnosticRelatedInformationCapability = !!(
  //   capabilities.textDocument &&
  //   capabilities.textDocument.publishDiagnostics &&
  //   capabilities.textDocument.publishDiagnostics.relatedInformation
  // )

  const result: InitializeResult = {
    capabilities: {
      completionProvider: { resolveProvider: false, triggerCharacters: ['#'] },
      // TODO(HiDeoo) see if possible to disable diagnostics entirely
      diagnosticProvider: { interFileDependencies: false, workspaceDiagnostics: false },
      textDocumentSync: TextDocumentSyncKind.Incremental,
    },
  }

  // if (hasWorkspaceFolderCapability) {
  //   result.capabilities.workspace = {
  //     workspaceFolders: {
  //       supported: true,
  //     },
  //   }
  // }

  lspOptions = deserializeLspOptions(initializationOptions)

  getLinksData(lspOptions)
    .then((result) => {
      linksData = result
      connection.console.info('Links data loaded successfully.')
    })
    .catch((error: unknown) => {
      connection.console.error(`Failed to load links data: ${error instanceof Error ? error.message : String(error)}`)
    })

  return result
}

function onConnectionCompletion({ position, textDocument }: CompletionParams) {
  if (!lspOptions) return

  const document = documents.get(textDocument.uri)
  if (!document) return

  const text = document.getText()
  const offset = document.offsetAt(position)
  const lineStart = text.lastIndexOf('\n', offset - 1) + 1
  const currentLine = text.slice(lineStart, offset)

  // TODO(HiDeoo) other types of links (md, mdx, components, etc.)
  if (!endsWithLinkUrl(currentLine)) return

  return [...linksData.entries()].map(([slug, data]) => {
    const item: CompletionItem = {
      kind: CompletionItemKind.File,
      label: slug,
    }

    if (data.title) item.labelDetails = { description: data.title }

    return item
  })
}
