import { slug } from 'github-slugger'

export function slugifyPath(path: string, withTrailingSlash = false): string {
  const pathSlug = ensureLeadingSlash(
    stripExtension(path)
      .replaceAll('\\', '/')
      .split('/')
      .map((part) => slug(part))
      .join('/'),
  )

  return withTrailingSlash ? ensureTrailingSlash(pathSlug) : pathSlug
}

function stripExtension(path: string) {
  const lastPeriodIndex = path.lastIndexOf('.')
  return path.slice(0, lastPeriodIndex === -1 ? undefined : lastPeriodIndex)
}

function ensureLeadingSlash(href: string): string {
  return href.startsWith('/') ? href : `/${href}`
}

function ensureTrailingSlash(href: string): string {
  return href.endsWith('/') ? href : `${href}/`
}
