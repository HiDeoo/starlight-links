export interface StarlightFsPaths {
  config: string
  content: string
}

// TODO(HiDeoo) ensure all values are used in the end
export interface StarlightConfig {
  base?: string
  defaultLocale?: string
  // TODO(HiDeoo) Do we need labels?
  locales?: Record<string, { label: string }>
  trailingSlash: 'always' | 'never' | 'ignore'
  srcDir?: string
}
