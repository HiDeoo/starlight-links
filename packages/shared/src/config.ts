export const StarlightLinksConfigSection = 'starlightLinks'

export const StarlightLinksDefaultConfig: StarlightLinksConfig = {
  configDirectories: ['.', './docs'],
  customComponents: [],
  useConsistentLocale: true,
}

export interface StarlightLinksConfig {
  configDirectories: string[]
  customComponents: [component: string, prop: string][]
  useConsistentLocale: boolean
}
