import path from 'node:path'

import type { StarlightLinksLspOptions } from 'starlight-links-shared/lsp.js'
import { FileType, Uri, workspace, type WorkspaceFolder } from 'vscode'

// https://github.com/withastro/astro/blob/6b92b3d455cb7b7ac09c5dcc0eceaabec1ba5903/packages/astro/src/core/config/config.ts#L27-L36
const configFileNames = new Set([
  'astro.config.mjs',
  'astro.config.js',
  'astro.config.ts',
  'astro.config.mts',
  'astro.config.cjs',
  'astro.config.cts',
])

export async function getStarlightFsPaths(
  workspaceFolder: WorkspaceFolder,
  configDirectories: string[],
): Promise<StarlightLinksLspOptions['fsPaths'] | undefined> {
  const astroConfigUri = await getAstroConfigUri(workspaceFolder, configDirectories)
  if (!astroConfigUri) return

  return {
    config: astroConfigUri.fsPath,
    // TODO(HiDeoo) custom src
    content: Uri.joinPath(Uri.file(path.dirname(astroConfigUri.fsPath)), 'src', 'content', 'docs').fsPath,
  }
}

async function getAstroConfigUri(workspaceFolder: WorkspaceFolder, configDirectories: string[]) {
  for (const configDirectory of configDirectories) {
    const uri = Uri.joinPath(workspaceFolder.uri, configDirectory)

    try {
      const entries = await workspace.fs.readDirectory(uri)

      for (const [name, type] of entries) {
        if (type === FileType.File && configFileNames.has(name)) {
          return Uri.joinPath(uri, name)
        }
      }
    } catch {
      // We can safely ignore errors related to missing directories.
    }
  }

  return
}
