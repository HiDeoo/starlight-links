import type { WorkspaceFolder } from 'vscode'

export function isWorkspaceWithSingleFolder(
  workspaceFolders: readonly WorkspaceFolder[] | undefined,
): workspaceFolders is readonly [WorkspaceFolder] {
  return workspaceFolders !== undefined && workspaceFolders.length === 1
}
