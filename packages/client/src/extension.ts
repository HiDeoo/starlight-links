import path from 'node:path'

import { serializeLspOptions } from 'starlight-links-shared/lsp.js'
import { type ExtensionContext, workspace } from 'vscode'
import { LanguageClient, TransportKind } from 'vscode-languageclient/node'

import { getConfig } from './libs/config'
import { getStarlightConfig, getStarlightConfigFsPath, getStarlightFsPaths } from './libs/starlight'
import { isWorkspaceWithSingleFolder } from './libs/vsc'

let client: LanguageClient | undefined

export async function activate(context: ExtensionContext) {
  if (!isWorkspaceWithSingleFolder(workspace.workspaceFolders)) {
    throw new Error('Starlight Links only supports single folder workspaces')
  }

  const starlightConfigFsPath = await getStarlightConfigFsPath(
    workspace.workspaceFolders[0],
    getConfig().configDirectories,
  )

  if (!starlightConfigFsPath) {
    throw new Error('Failed to find a Starlight instance in the current workspace')
  }

  const starlightConfig = await getStarlightConfig(starlightConfigFsPath)

  const serverModule = context.asAbsolutePath(path.join('dist', 'server.js'))

  client = new LanguageClient(
    'starlight-links',
    'Starlight Links',
    {
      run: { module: serverModule, transport: TransportKind.ipc },
      debug: { module: serverModule, transport: TransportKind.ipc },
    },
    {
      // TODO(HiDeoo) md
      // TODO(HiDeoo) mdx
      documentSelector: [
        { scheme: 'file', language: 'plaintext' },
        { scheme: 'untitled', language: 'plaintext' },
      ],
      initializationOptions: serializeLspOptions(
        getStarlightFsPaths(starlightConfigFsPath, starlightConfig),
        starlightConfig,
      ),
      synchronize: { fileEvents: workspace.createFileSystemWatcher('**/*.md') },
    },
  )

  await client.start()
}

export function deactivate() {
  return client?.stop()
}
