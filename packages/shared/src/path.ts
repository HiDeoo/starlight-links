import Slugger, { slug } from 'github-slugger'

export function getNewSlugger() {
  return new Slugger()
}

export function slugifyPath(path: string, withTrailingSlash = false, base?: string): string {
  const pathSlug = ensureLeadingSlash(
    [
      ...(base ? [base] : []),
      ...stripExtension(path)
        .replace(/index$/, '')
        .replaceAll('\\', '/')
        .split('/')
        .map((part) => slug(part)),
    ].join('/'),
  )

  return withTrailingSlash ? ensureTrailingSlash(pathSlug) : pathSlug
}

export function stripExtension(path: string) {
  const lastPeriodIndex = path.lastIndexOf('.')
  return path.slice(0, lastPeriodIndex === -1 ? undefined : lastPeriodIndex)
}

function ensureLeadingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

function ensureTrailingSlash(path: string): string {
  return path.endsWith('/') ? path : `${path}/`
}

export function stripLeadingSlash(path: string): string {
  return path.startsWith('/') ? path.slice(1) : path
}

export function stripTrailingSlash(path: string): string {
  return path.endsWith('/') ? path.slice(0, -1) : path
}
