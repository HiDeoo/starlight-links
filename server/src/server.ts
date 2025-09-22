import {
  createConnection,
  ProposedFeatures,
  TextDocumentSyncKind,
  type InitializeResult,
  TextDocuments,
  CompletionItemKind,
} from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'

import { getConnectionConfig } from '../../shared/dist/config.js'

const connection = createConnection(ProposedFeatures.all)

const documents = new TextDocuments(TextDocument)

connection.onInitialize(() => {
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
      completionProvider: { triggerCharacters: ['#'] },
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

  connection.console.log('🚨 [server.ts:53] InitializeResult')

  return result
})

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

connection.onCompletion(async () => {
  connection.console.log('🚨 [server.ts:53] cconnection.onCompletion')
  const config = await getConnectionConfig(connection)
  connection.console.log(JSON.stringify(config, null, 2))

  // The pass parameter contains the position of the text document in
  // which code complete got requested. For the example we ignore this
  // info and always provide the same completion items.
  return [
    {
      label: 'TypeScript',
      kind: CompletionItemKind.Text,
      data: 1,
    },
    {
      label: 'JavaScript',
      kind: CompletionItemKind.Text,
      data: 2,
    },
  ]
})

connection.onCompletionResolve((item) => {
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

// Listen on the connection
connection.listen()
