import { StarlightLinksConfigSection, StarlightLinksDefaultConfig } from 'starlight-links-shared/config.js'
import { workspace } from 'vscode'

export function getConfig() {
  return { ...StarlightLinksDefaultConfig, ...workspace.getConfiguration(StarlightLinksConfigSection) }
}
