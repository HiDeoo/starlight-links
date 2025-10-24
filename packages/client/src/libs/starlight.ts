import path from 'node:path'

import type { StarlightFsPaths, StarlightProject } from 'starlight-links-shared/starlight.js'
import { FileType, Uri, workspace, type WorkspaceFolder } from 'vscode'

import { getStarlightProjectFromConfig } from './ast'

// https://github.com/withastro/astro/blob/6b92b3d455cb7b7ac09c5dcc0eceaabec1ba5903/packages/astro/src/core/config/config.ts#L27-L36
const configBaseName = 'astro.config'
const fileExtensions = ['.mjs', '.js', '.ts', '.mts', '.cjs', '.cts']

export async function getStarlightConfigFsPath(workspaceFolder: WorkspaceFolder, configDirectories: string[]) {
  const astroConfigUri = await getAstroConfigUri(workspaceFolder, configDirectories)
  if (!astroConfigUri) return

  return astroConfigUri.fsPath
}

export async function getStarlightProject(fsPath: string) {
  const configData = await workspace.fs.readFile(Uri.file(fsPath))
  const configStr = new TextDecoder().decode(configData)

  return getStarlightProjectFromConfig(configStr, async (relativeFsPath: string) => {
    const rootDir = path.dirname(fsPath)
    const fileDir = path.join(rootDir, path.dirname(relativeFsPath))
    const fileBaseName = path.basename(relativeFsPath)

    const fileUri = await findFileInDirectory(Uri.file(fileDir), fileBaseName)
    if (!fileUri) throw new Error(`Failed to resolve file at relative path \`${relativeFsPath}\`.`)

    const data = await workspace.fs.readFile(fileUri)
    return new TextDecoder().decode(data)
  })
}

async function getAstroConfigUri(workspaceFolder: WorkspaceFolder, configDirectories: string[]) {
  for (const configDirectory of configDirectories) {
    const uri = Uri.joinPath(workspaceFolder.uri, configDirectory)

    const file = await findFileInDirectory(uri, configBaseName)
    if (file) return file
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

async function findFileInDirectory(directory: Uri, filename: string) {
  try {
    await workspace.fs.stat(directory)
    const entries = await workspace.fs.readDirectory(directory)

    for (const [name, type] of entries) {
      if (type !== FileType.File) continue

      for (const ext of fileExtensions) {
        if (name === `${filename}${ext}`) return Uri.joinPath(directory, name)
      }
    }
  } catch {
    // We can safely ignore errors related to missing directories.
  }

  return
}
