import { stripLeadingSlash } from 'starlight-links-shared/path.js'
import type { StarlightConfig } from 'starlight-links-shared/starlight.js'

export function getLocaleFromSlug(slug: string, locales: StarlightConfig['locales']) {
  if (!locales) return
  const baseSegment = stripLeadingSlash(slug).split('/')[0]
  if (baseSegment && locales[baseSegment]) return baseSegment
  return
}
