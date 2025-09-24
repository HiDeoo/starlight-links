import { fileURLToPath } from 'node:url'

import { StarlightLinksDefaultConfig } from 'starlight-links-shared/config.js'
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

import { getConfig } from './libs/config'
import { getLocaleFromSlug } from './libs/i18n'
import { endsWithLinkUrl, getPositionInfos } from './libs/markdown'
import { getLinksData, type LinksData } from './libs/starlight'

const connection = createConnection(ProposedFeatures.all)
const documents = new TextDocuments(TextDocument)

let extConfig = StarlightLinksDefaultConfig
let lspOptions: StarlightLinksLspOptions | undefined
let linksData: LinksData = new Map()

runLsp()

function runLsp() {
  connection.onInitialize(onConnectionInitialize)
  connection.onInitialized(onConnectionInitialized)
  connection.onCompletion(onConnectionCompletion)

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
      // TODO(HiDeoo) triggers
      completionProvider: { resolveProvider: false, triggerCharacters: ['/', '#'] },
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

  return result
}

async function onConnectionInitialized() {
  if (!lspOptions) return

  extConfig = await getConfig(connection)

  getLinksData(lspOptions)
    .then((result) => {
      linksData = result
      connection.console.info('Links data loaded successfully.')
    })
    .catch((error: unknown) => {
      connection.console.error(`Failed to load links data: ${error instanceof Error ? error.message : String(error)}`)
    })
}

function onConnectionCompletion({ position, textDocument }: CompletionParams) {
  if (!lspOptions) return

  const document = documents.get(textDocument.uri)
  if (!document) return

  const text = document.getText()
  const offset = document.offsetAt(position)
  const lineStart = text.lastIndexOf('\n', offset - 1) + 1
  const currentLineToCursor = text.slice(lineStart, offset)

  // TODO(HiDeoo) Bug: typing `/` and accepting a completion results in `//slug-of-the-page`

  // TODO(HiDeoo) other types of links (md, mdx, components, etc.)
  const positionInfos = getPositionInfos(currentLineToCursor)
  if (!positionInfos.isLinkUrl) return
  if (positionInfos.linkUrl.startsWith('#')) return

  const currentFsPath = fileURLToPath(textDocument.uri)
  const currentLocale = getLocaleFromSlug(
    currentFsPath.replace(lspOptions.fsPaths.content, ''),
    lspOptions.config.locales,
  )

  const items: CompletionItem[] = []

  for (const [fsPath, data] of linksData) {
    if (fsPath === currentFsPath) continue

    if (extConfig.useConsistentLocale && lspOptions.config.isMultilingual) {
      if (currentLocale && data.locale !== currentLocale) continue
      if (!currentLocale && data.locale) continue
    }

    const item: CompletionItem = {
      kind: CompletionItemKind.File,
      label: data.slug,
    }

    if (data.title) item.labelDetails = { description: data.title }

    items.push(item)
  }

  return items
}
