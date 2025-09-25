import fs from 'node:fs/promises'
import path from 'node:path'

import matter from 'gray-matter'
import pLimit from 'p-limit'
import type { StarlightLinksLspOptions } from 'starlight-links-shared/lsp.js'
import { slugifyPath, stripExtension } from 'starlight-links-shared/path.js'
import { glob } from 'tinyglobby'

import { getLocaleFromSlug } from './i18n'
import { getFragments } from './markdown'

const runWithConcurrency = pLimit(10)

export async function getLinksData(lspOptions: StarlightLinksLspOptions): Promise<LinksData> {
  let files = await glob('**/[^_]*.{md,mdx}', { cwd: lspOptions.fsPaths.content, onlyFiles: true })
  files = files.filter((file) => stripExtension(path.basename(file)) !== '404')

  // TODO(HiDeoo) of showing all links: sort results, e.g. based on the current locale, file in the same locales should be first

  // eslint-disable-next-line unicorn/no-array-method-this-argument
  const data = await runWithConcurrency.map(files, async (file) =>
    getLinkData(lspOptions, path.join(lspOptions.fsPaths.content, file)),
  )

  return new Map(data)
}

export async function getLinkData(lspOptions: StarlightLinksLspOptions, fsPath: string, relativeFsPath?: string) {
  const { config, context } = lspOptions
  const frontmatter = await readFrontmatter(fsPath)
  relativeFsPath ??= getContentFsPath(lspOptions, fsPath)
  const slug = frontmatter?.slug ?? slugifyPath(relativeFsPath, context.trailingSlash !== 'never', context.base)

  return [
    slug,
    {
      fsPath,
      locale: config.isMultilingual ? getLocaleFromSlug(slug, config.locales) : undefined,
      title: frontmatter?.title,
      description: frontmatter?.description,
    },
  ] satisfies [LinkDataKey, LinkDataValue]
}

export function getContentFsPath({ fsPaths }: StarlightLinksLspOptions, fsPath: string) {
  return fsPath.replace(fsPaths.content, '')
}

export async function getContentFragments(path: string) {
  const content = await readContent(path)
  return getFragments(content)
}

async function readFrontmatter(path: string) {
  const handle = await fs.open(path, 'r')

  let position = 0
  let content = ''
  let delimiterCount = 0

  try {
    const buffer = Buffer.alloc(1024)

    while (delimiterCount < 2) {
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, position)
      if (bytesRead === 0) break

      const chunk = buffer.toString('utf8', 0, bytesRead)
      content += chunk
      position += bytesRead

      const lines = content.split('\n')
      delimiterCount = 0

      for (const line of lines) {
        if (line.trim() !== '---') continue

        delimiterCount++

        if (delimiterCount === 2) {
          const endIndex = content.indexOf('---', content.indexOf('---') + 3)
          return matter(content.slice(0, Math.max(0, endIndex + 3))).data as StarlightFrontmatter
        }
      }
    }
  } finally {
    await handle.close()
  }

  return
}

async function readContent(path: string) {
  const file = await fs.readFile(path, 'utf8')
  return matter(file).content
}

type LinkDataKey = string

interface LinkDataValue {
  fsPath: string
  locale?: string | undefined
  title?: string | undefined
  description?: string | undefined
}

export type LinksData = Map<LinkDataKey, LinkDataValue>

interface StarlightFrontmatter {
  title: string
  description?: string
  slug?: string
}
