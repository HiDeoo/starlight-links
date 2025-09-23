import type { StarlightConfig, StarlightFsPaths } from './starlight'

export function serializeLspOptions(fsPaths: StarlightFsPaths, config: StarlightConfig): StarlightLinksLspOptions {
  return {
    config,
    fsPaths,
  }
}

export function deserializeLspOptions(options: unknown): StarlightLinksLspOptions {
  return options as StarlightLinksLspOptions
}

export interface StarlightLinksLspOptions {
  config: StarlightConfig
  fsPaths: StarlightFsPaths
}
