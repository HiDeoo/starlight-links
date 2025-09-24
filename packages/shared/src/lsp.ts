import type { StarlightFsPaths, StarlightProject } from './starlight'

export function serializeLspOptions(fsPaths: StarlightFsPaths, project: StarlightProject): StarlightLinksLspOptions {
  return {
    ...project,
    fsPaths,
  }
}

export function deserializeLspOptions(options: unknown): StarlightLinksLspOptions {
  return options as StarlightLinksLspOptions
}

export interface StarlightLinksLspOptions extends StarlightProject {
  fsPaths: StarlightFsPaths
}
