export const StarlightLinksConfigSection = 'starlight-links'

export const StarlightLinksDefaultConfig: StarlightLinksConfig = {
  configDirectories: ['.', './docs'],
}

export interface StarlightLinksConfig {
  configDirectories: string[]
}
