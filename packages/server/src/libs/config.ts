import {
  StarlightLinksConfigSection,
  StarlightLinksDefaultConfig,
  type StarlightLinksConfig,
} from 'starlight-links-shared/config.js'
import type { Connection } from 'vscode-languageserver/node'

export async function getConfig(connection: Connection) {
  const config = (await connection.workspace.getConfiguration(StarlightLinksConfigSection)) as StarlightLinksConfig

  return { ...StarlightLinksDefaultConfig, ...config }
}
