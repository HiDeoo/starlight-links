export const StarlightMarkdownContentGlob = '**/[^_]*.{md,mdx}'

export interface StarlightFsPaths {
  config: string
  content: string
}

export interface StarlightConfig {
  isMultilingual: boolean
  locales?: Record<string, string>
}

export interface StarlightContext {
  base?: string
  trailingSlash: 'always' | 'never' | 'ignore'
  srcDir?: string
}

export interface StarlightProject {
  config: StarlightConfig
  context: StarlightContext
}
