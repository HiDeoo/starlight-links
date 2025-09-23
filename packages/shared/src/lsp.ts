export function serializeLspOptions(fsPaths: StarlightFsPaths): StarlightLinksLspOptions {
  return {
    fsPaths,
  }
}

export function deserializeLspOptions(options: unknown): StarlightLinksLspOptions {
  return options as StarlightLinksLspOptions
}

export interface StarlightLinksLspOptions {
  fsPaths: StarlightFsPaths
}

interface StarlightFsPaths {
  config: string
  content: string
}
