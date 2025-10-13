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
  type HoverParams,
  MarkupKind,
  type Position,
} from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'

import { getConfig } from './libs/config'
import { getLocaleFromSlug } from './libs/i18n'
import {
  getLinkComponentMap,
  getStarlightLinkAtPosition,
  getStarlightLinks,
  type LinkComponentMap,
} from './libs/markdown'
import { getContentFragments, getContentFsPath, getLinkData, getLinksData, type LinksData } from './libs/starlight'

const connection = createConnection(ProposedFeatures.all)
const documents = new TextDocuments(TextDocument)

let extConfig = StarlightLinksDefaultConfig
let linkComponentMap: LinkComponentMap = {}
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
  connection.onHover(onConnectionHover)

  documents.listen(connection)
  connection.listen()
}

function onConnectionInitialize({ initializationOptions }: InitializeParams) {
  const result: InitializeResult = {
    capabilities: {
      completionProvider: { resolveProvider: false, triggerCharacters: ['/', '#'] },
      definitionProvider: true,
      documentLinkProvider: { resolveProvider: true },
      hoverProvider: true,
      textDocumentSync: TextDocumentSyncKind.Incremental,
    },
  }

  lspOptions = deserializeLspOptions(initializationOptions)

  return result
}

async function onConnectionInitialized() {
  if (!lspOptions) return

  extConfig = await getConfig(connection)
  linkComponentMap = getLinkComponentMap(extConfig)

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

  const document = getDocument(completion)
  if (!document) return

  const starlightLink = getStarlightLinkAtPosition(document, linkComponentMap, completion)
  if (!starlightLink) return

  const items: CompletionItem[] = []
  const range = { start: starlightLink.start, end: starlightLink.end }

  if (starlightLink.url.includes('#')) {
    const linkData = linksData.get(starlightLink.slug)
    if (!linkData) return

    const fragments = await getContentFragments(linkData.fsPath)

    for (const fragment of fragments) {
      items.push(makeCompletionItem(range, `${starlightLink.slug}#${fragment.slug}`, fragment.label))
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

    items.push(makeCompletionItem(range, slug, data.title))
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

  const document = getDocument(definition)
  if (!document) return

  const starlightLink = getStarlightLinkAtPosition(document, linkComponentMap, definition)
  if (!starlightLink) return

  const linkData = linksData.get(starlightLink.slug)
  if (!linkData) return

  const position = { line: 0, character: 0 }

  return [
    LocationLink.create(
      pathToFileURL(linkData.fsPath).toString(),
      { start: position, end: position },
      { start: position, end: position },
    ),
  ]
}

function onConnectionDocumentLinks({ textDocument }: DocumentLinkParams) {
  if (!lspOptions) return []

  const document = documents.get(textDocument.uri)
  if (!document) return []

  const links: DocumentLink[] = []
  const markdownLinks = getStarlightLinks(document, linkComponentMap)

  for (const markdownLink of markdownLinks) {
    const linkData = linksData.get(markdownLink.slug)
    if (!linkData) continue

    links.push({
      target: pathToFileURL(linkData.fsPath).toString(),
      range: { start: markdownLink.start, end: markdownLink.end },
    })
  }

  return links
}

function onConnectionHover(hover: HoverParams) {
  if (!lspOptions) return

  const document = getDocument(hover)
  if (!document) return

  const starlightLink = getStarlightLinkAtPosition(document, linkComponentMap, hover)
  if (!starlightLink) return

  const linkData = linksData.get(starlightLink.slug)
  if (!linkData) return

  let value = `## ${linkData.title}`
  if (linkData.description) value += `\n\n${linkData.description}`

  return {
    contents: {
      kind: MarkupKind.Markdown,
      value,
    },
    range: { start: starlightLink.start, end: starlightLink.end },
  }
}

function getDocument({ textDocument }: TextDocumentPositionParams) {
  return documents.get(textDocument.uri)
}

function makeCompletionItem(
  range: { start: Position; end: Position },
  label: string,
  details?: string,
): CompletionItem {
  const item: CompletionItem = {
    kind: CompletionItemKind.File,
    label,
    textEdit: { newText: label, range: { start: range.start, end: range.end } },
  }

  if (details) item.labelDetails = { description: details }

  return item
}
