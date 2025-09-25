import { fileURLToPath, pathToFileURL } from 'node:url'

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
  type DidChangeWatchedFilesParams,
  FileChangeType,
  type DefinitionParams,
  LocationLink,
  type TextDocumentPositionParams,
  type DocumentLinkParams,
  type DocumentLink,
} from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'

import { getConfig } from './libs/config'
import { getLocaleFromSlug } from './libs/i18n'
import { getMarkdownContentAtPosition, getMarkdownLinks, type MarkdownLink } from './libs/markdown'
import { getContentFragments, getContentFsPath, getLinkData, getLinksData, type LinksData } from './libs/starlight'

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
  connection.onDidChangeWatchedFiles(onWatchedFilesChange)
  connection.onDefinition(onConnectionDefinition)
  connection.onDocumentLinks(onConnectionDocumentLinks)

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
      completionProvider: { resolveProvider: false, triggerCharacters: ['/', '#'] },
      definitionProvider: true,
      documentLinkProvider: { resolveProvider: true },
      // TODO(HiDeoo) is it possible to override the Markdown LSP diagnostics when a link is valid?
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

async function onConnectionCompletion(completion: CompletionParams) {
  if (!lspOptions) return

  const line = getLineAtPosition(completion)
  if (!line) return

  // TODO(HiDeoo) other types of links (md, mdx, components, Markdown references, etc.)
  const markdownContent = getMarkdownContentAtPosition(line.text, line.position)

  if (markdownContent.type === 'unknown') return
  if (markdownContent.url.startsWith('#')) return

  const items: CompletionItem[] = []
  const context: CompletionItemContext = {
    document: line.document,
    lineStart: line.start,
    markdownLink: markdownContent,
  }

  if (markdownContent.type === 'fragment') {
    const linkData = linksData.get(markdownContent.url)
    if (!linkData) return

    const fragments = await getContentFragments(linkData.fsPath)

    for (const fragment of fragments) {
      items.push(makeCompletionItem(context, `${markdownContent.url}#${fragment.slug}`, fragment.label))
    }

    return items
  }

  const currentFsPath = fileURLToPath(completion.textDocument.uri)
  const currentLocale = getLocaleFromSlug(getContentFsPath(lspOptions, currentFsPath), lspOptions.config.locales)

  for (const [slug, data] of linksData) {
    if (data.fsPath === currentFsPath) continue

    if (extConfig.useConsistentLocale && lspOptions.config.isMultilingual) {
      if (currentLocale && data.locale !== currentLocale) continue
      if (!currentLocale && data.locale) continue
    }

    items.push(makeCompletionItem(context, slug, data.title))
  }

  return items
}

async function onWatchedFilesChange({ changes }: DidChangeWatchedFilesParams) {
  if (!lspOptions) return

  for (const change of changes) {
    const fsPath = fileURLToPath(change.uri)

    switch (change.type) {
      case FileChangeType.Created: {
        const [slug, data] = await getLinkData(lspOptions, fsPath)
        linksData.set(slug, data)
        break
      }
      case FileChangeType.Deleted: {
        for (const [slug, data] of linksData) {
          if (data.fsPath !== fsPath) continue
          linksData.delete(slug)
          break
        }
        break
      }
    }
  }
}

function onConnectionDefinition(definition: DefinitionParams) {
  if (!lspOptions) return

  const line = getLineAtPosition(definition)
  if (!line) return

  // TODO(HiDeoo) other types of links (md, mdx, components, Markdown references, etc.)
  const markdownContent = getMarkdownContentAtPosition(line.text, line.position)

  if (markdownContent.type === 'unknown') return
  if (markdownContent.url.startsWith('#')) return

  const linkData = linksData.get(markdownContent.url)
  if (!linkData) return null

  // TODO(HiDeoo) fragments

  return [
    LocationLink.create(
      pathToFileURL(linkData.fsPath).toString(),
      {
        start: {
          line: 0,
          character: 0,
        },
        end: {
          line: 0,
          character: 0,
        },
      },
      {
        start: {
          line: 0,
          character: 0,
        },
        end: {
          line: 0,
          character: 0,
        },
      },
    ),
  ]
}

function onConnectionDocumentLinks({ textDocument }: DocumentLinkParams) {
  if (!lspOptions) return []

  const document = documents.get(textDocument.uri)
  if (!document) return []

  const links: DocumentLink[] = []
  const markdownLinks = getMarkdownLinks(document.getText())

  for (const markdownLink of markdownLinks) {
    const linkData = linksData.get(markdownLink.url)
    if (!linkData) continue

    // TODO(HiDeoo) fragments

    links.push({
      target: pathToFileURL(linkData.fsPath).toString(),
      range: {
        start: document.positionAt(document.offsetAt({ line: markdownLink.line, character: markdownLink.start })),
        end: document.positionAt(document.offsetAt({ line: markdownLink.line, character: markdownLink.end })),
      },
    })
  }

  return links
}

function getLineAtPosition({ position, textDocument }: TextDocumentPositionParams) {
  const document = documents.get(textDocument.uri)
  if (!document) return

  const text = document.getText()
  const offset = document.offsetAt(position)
  const lineStart = text.lastIndexOf('\n', offset - 1) + 1
  const lineEnd = text.indexOf('\n', offset)
  const currentLine = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd)

  return {
    document,
    position: offset - lineStart,
    start: lineStart,
    text: currentLine,
  }
}

function makeCompletionItem(
  { document, lineStart, markdownLink }: CompletionItemContext,
  label: string,
  details?: string,
): CompletionItem {
  const item: CompletionItem = {
    kind: CompletionItemKind.File,
    label,
    textEdit: {
      newText: label,
      range: {
        start: document.positionAt(lineStart + markdownLink.start),
        end: document.positionAt(lineStart + markdownLink.end),
      },
    },
  }

  if (details) item.labelDetails = { description: details }

  return item
}

interface CompletionItemContext {
  document: TextDocument
  lineStart: number
  markdownLink: MarkdownLink
}
