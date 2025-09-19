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

export async function isStarlightProject(workspaceFolder: WorkspaceFolder, configDirectories: string[]) {
  const config = await getAstroConfigUri(workspaceFolder, configDirectories)

  return Boolean(config)
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

  return undefined
}

export interface StarlightUris {
  config: Uri
  content: Uri
  workspace: Uri
}
