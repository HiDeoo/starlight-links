import path from 'node:path'

import { StarlightLinksConfigSection } from 'starlight-links-shared/config.js'
import { serializeLspOptions } from 'starlight-links-shared/lsp.js'
import type { StarlightProject } from 'starlight-links-shared/starlight.js'
import { type ExtensionContext, type LogOutputChannel, window, workspace } from 'vscode'
import { LanguageClient, TransportKind } from 'vscode-languageclient/node'

import { getConfig } from './libs/config'
import { getStarlightProject, getStarlightConfigFsPath, getStarlightFsPaths } from './libs/starlight'
import { isWorkspaceWithSingleFolder } from './libs/vsc'

let client: LanguageClient | undefined

export async function activate(context: ExtensionContext) {
  const logger = window.createOutputChannel('Starlight Links', { log: true })

  context.subscriptions.push(
    workspace.onDidChangeConfiguration(async (event) => {
      if (!event.affectsConfiguration(StarlightLinksConfigSection)) return
      logger.info('Starlight Links configuration changed.')
      await startLspServer(context, logger)
    }),
    { dispose: () => client?.stop() },
  )

  await startLspServer(context, logger)
}

export function deactivate() {
  return client?.stop()
}

async function startLspServer(context: ExtensionContext, logger: LogOutputChannel) {
  await client?.stop()

  if (!isWorkspaceWithSingleFolder(workspace.workspaceFolders)) {
    logger.info('Starlight Links only supports single folder workspaces.')
    return
  }

  const starlightConfigFsPath = await getStarlightConfigFsPath(
    workspace.workspaceFolders[0],
    getConfig().configDirectories,
  )

  if (!starlightConfigFsPath) {
    logger.info('No Starlight configuration file found in the current workspace.')
    return
  }

  let starlightProject: StarlightProject

  try {
    starlightProject = await getStarlightProject(starlightConfigFsPath)
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error))
    return
  }

  const serverModule = context.asAbsolutePath(path.join('dist', 'server.js'))

  client = new LanguageClient(
    'starlight-links',
    'Starlight Links',
    {
      run: { module: serverModule, transport: TransportKind.ipc },
      debug: { module: serverModule, transport: TransportKind.ipc },
    },
    {
      // TODO(HiDeoo) mdx
      documentSelector: [{ scheme: 'file', language: 'markdown' }],
      initializationOptions: serializeLspOptions(
        getStarlightFsPaths(starlightConfigFsPath, starlightProject),
        starlightProject,
      ),
      // TODO(HiDeoo) md/mdx
      synchronize: { fileEvents: workspace.createFileSystemWatcher('**/*.md') },
    },
  )

  await client.start()
}
