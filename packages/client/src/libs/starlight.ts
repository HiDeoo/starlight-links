import path from 'node:path'

import type { StarlightFsPaths, StarlightProject } from 'starlight-links-shared/starlight.js'
import { FileType, Uri, workspace, type WorkspaceFolder } from 'vscode'

import { getStarlightProjectFromConfig } from './ast'

// https://github.com/withastro/astro/blob/6b92b3d455cb7b7ac09c5dcc0eceaabec1ba5903/packages/astro/src/core/config/config.ts#L27-L36
const configFileNames = new Set([
  'astro.config.mjs',
  'astro.config.js',
  'astro.config.ts',
  'astro.config.mts',
  'astro.config.cjs',
  'astro.config.cts',
])

export async function getStarlightConfigFsPath(workspaceFolder: WorkspaceFolder, configDirectories: string[]) {
  const astroConfigUri = await getAstroConfigUri(workspaceFolder, configDirectories)
  if (!astroConfigUri) return

  return astroConfigUri.fsPath
}

export async function getStarlightProject(fsPath: string) {
  const configData = await workspace.fs.readFile(Uri.file(fsPath))
  const configStr = Buffer.from(configData).toString('utf8')

  return getStarlightProjectFromConfig(configStr)
}

async function getAstroConfigUri(workspaceFolder: WorkspaceFolder, configDirectories: string[]) {
  for (const configDirectory of configDirectories) {
    const uri = Uri.joinPath(workspaceFolder.uri, configDirectory)

    try {
      await workspace.fs.stat(uri)
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

export function getStarlightFsPaths(configFsPath: string, project: StarlightProject): StarlightFsPaths {
  return {
    config: configFsPath,
    content: Uri.joinPath(Uri.file(path.dirname(configFsPath)), project.context.srcDir ?? 'src', 'content', 'docs')
      .fsPath,
  }
}
