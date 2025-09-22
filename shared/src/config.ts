import type { workspace } from 'vscode'
import type { Connection } from 'vscode-languageserver/node'

const section = 'starlight-i18n'

const defaults: StarlightLinksConfig = {
  configDirectories: ['.', './docs'],
}

export function getWorkspaceConfig(wk: typeof workspace) {
  return { ...defaults, ...wk.getConfiguration(section) }
}

export async function getConnectionConfig(connection: Connection) {
  const config = (await connection.workspace.getConfiguration(section)) as StarlightLinksConfig

  return { ...defaults, ...config }
}

interface StarlightLinksConfig {
  configDirectories: string[]
}
