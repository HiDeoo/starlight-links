import fs from 'node:fs/promises'
import path from 'node:path'

import matter from 'gray-matter'
import pLimit from 'p-limit'
import type { StarlightLinksLspOptions } from 'starlight-links-shared/lsp.js'
import { glob } from 'tinyglobby'

import { slugifyPath } from './path'

const runWithConcurrency = pLimit(10)

// TODO(HiDeoo) file added, removed, or renamed
// TODO(HiDeoo) Astro base

export async function getLinksData(lspOptions: StarlightLinksLspOptions): Promise<LinksData> {
  const files = await glob('**/[^_]*.{md,mdx}', { cwd: lspOptions.fsPaths.content, onlyFiles: true })

  // TODO(HiDeoo) option to only show same locale links
  // TODO(HiDeoo) of showing all links: sort results, e.g. based on the current locale, file in the same locales should be first

  // eslint-disable-next-line unicorn/no-array-method-this-argument
  const data = await runWithConcurrency.map(files, async (file) => {
    const fsPath = path.join(lspOptions.fsPaths.content, file)
    const frontmatter = await readFrontmatter(fsPath)
    const slug = frontmatter?.slug ?? slugifyPath(file, lspOptions.config.trailingSlash !== 'never')

    return [
      slug,
      {
        fsPath,
        title: frontmatter?.title,
      },
    ] satisfies [LinkDataKey, LinkDataValue]
  })

  return new Map(data)
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

type LinkDataKey = string

interface LinkDataValue {
  fsPath: string
  title?: string | undefined
}

export type LinksData = Map<LinkDataKey, LinkDataValue>

interface StarlightFrontmatter {
  title: string
  slug?: string
}
