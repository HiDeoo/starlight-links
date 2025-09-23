import { slug } from 'github-slugger'

export function slugifyPath(path: string) {
  // TODO(HiDeoo) trailing slashes
  return ensureLeadingSlash(
    stripExtension(path)
      .replaceAll('\\', '/')
      .split('/')
      .map((part) => slug(part))
      .join('/'),
  )
}

function stripExtension(path: string) {
  const lastPeriodIndex = path.lastIndexOf('.')
  return path.slice(0, lastPeriodIndex === -1 ? undefined : lastPeriodIndex)
}

function ensureLeadingSlash(href: string): string {
  return href.startsWith('/') ? href : `/${href}`
}
