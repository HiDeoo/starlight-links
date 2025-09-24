export const StarlightLinksConfigSection = 'starlightLinks'

export const StarlightLinksDefaultConfig: StarlightLinksConfig = {
  configDirectories: ['.', './docs'],
  useConsistentLocale: true,
}

export interface StarlightLinksConfig {
  configDirectories: string[]
  useConsistentLocale: boolean
}
