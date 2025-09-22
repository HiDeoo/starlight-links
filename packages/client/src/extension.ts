import path from 'node:path'

import { getWorkspaceConfig } from 'starlight-links-shared/config.js'
import { isStarlightProject } from 'starlight-links-shared/starlight.js'
import { type ExtensionContext, workspace } from 'vscode'
import { LanguageClient, TransportKind } from 'vscode-languageclient/node'

import { isWorkspaceWithSingleFolder } from './libs/vsc'

let client: LanguageClient | undefined

export async function activate(context: ExtensionContext) {
  if (!isWorkspaceWithSingleFolder(workspace.workspaceFolders)) {
    throw new Error('Starlight Links only supports single folder workspaces.')
  }

  if (!(await isStarlightProject(workspace.workspaceFolders[0], getWorkspaceConfig(workspace).configDirectories))) {
    throw new Error('Failed to find a Starlight instance in the current workspace.')
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
      documentSelector: [
        { scheme: 'file', language: 'plaintext' },
        { scheme: 'untitled', language: 'plaintext' },
      ],
      // TODO(HiDeoo) mdx
      synchronize: { fileEvents: workspace.createFileSystemWatcher('**/*.md') },
    },
  )

  await client.start()
}

export function deactivate() {
  return client?.stop()
}
