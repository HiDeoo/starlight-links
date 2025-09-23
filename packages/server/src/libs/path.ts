import { slug } from 'github-slugger'

export function slugifyPath(path: string) {
  // TODO(HiDeoo) leading/trailing slashes
  return stripExtension(path)
    .replaceAll('\\', '/')
    .split('/')
    .map((part) => slug(part))
    .join('/')
}

function stripExtension(path: string) {
  const lastPeriodIndex = path.lastIndexOf('.')
  return path.slice(0, lastPeriodIndex === -1 ? undefined : lastPeriodIndex)
}
