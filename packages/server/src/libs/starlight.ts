import path from 'node:path'

import type { StarlightLinksLspOptions } from 'starlight-links-shared/lsp.js'
import { glob } from 'tinyglobby'

import { slugifyPath } from './path'

// TODO(HiDeoo) file added, removed, or renamed

export async function getLinksData(lspOptions: StarlightLinksLspOptions): Promise<LinksData> {
  const files = await glob('**/[^_]*.{md,mdx}', { cwd: lspOptions.fsPaths.content, onlyFiles: true })

  // TODO(HiDeoo) custom slugs in frontmatter
  // TODO(HiDeoo) option to only show same locale links
  // TODO(HiDeoo) of showing all links: sort results, e.g. based on the current locale, file in the same locales should be first

  return new Map(
    files.map((file) => [
      slugifyPath(file),
      {
        fsPath: path.join(lspOptions.fsPaths.content, file),
        // TODO(HiDeoo) title for extra infos
      },
    ]),
  )
}

export type LinksData = Map<
  string,
  {
    fsPath: string
  }
>
