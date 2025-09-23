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

  connection.onCompletionResolve((item) => {
    connection.console.log('😡😡😡😡😡')
    connection.console.log(JSON.stringify(item, null, 2))

    // TODO(HiDeoo) What is the point of this, how to see this extra info?
    if (item.data === 1) {
      item.detail = 'TypeScript details'
      item.documentation = 'TypeScript documentation'
    } else if (item.data === 2) {
      item.detail = 'JavaScript details'
      item.documentation = 'JavaScript documentation'
    }
    return item
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
      completionProvider: { resolveProvider: true, triggerCharacters: ['#'] },
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
      // TODO(HiDeoo)
      connection.console.log('🏃‍➡️🏃‍➡️🏃‍➡️ Links data loaded:')
    })
    .catch(() => {
      // TODO(HiDeoo)
      connection.console.error(`🏃‍➡️🏃‍➡️🏃‍➡️ Failed to load links data`)
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

  if (!endsWithLinkUrl(currentLine)) return

  return [...linksData.keys()].map((slug) => ({
    label: slug,
    kind: CompletionItemKind.Text,
  }))
}
