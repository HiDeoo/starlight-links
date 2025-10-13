import assert from 'node:assert/strict'
import { setTimeout } from 'node:timers/promises'

import {
  type CompletionItem,
  commands,
  CompletionItemKind,
  ConfigurationTarget,
  Position,
  Selection,
  window,
  workspace,
} from 'vscode'

export function revertFile() {
  return commands.executeCommand('workbench.action.files.revert')
}

export function write(text: string) {
  return commands.executeCommand('type', { text })
}

// Line and column are humman-readable (1-based), usually visible in the editor's status bar.
export function moveCursor(line: number, column: number) {
  const editor = getActiveEditor()
  const position = new Position(line - 1, column - 1)
  editor.selection = new Selection(position, position)
}

// Line is human-readable (1-based), usually visible in the editor's status bar.
export function getLineText(line: number) {
  const editor = getActiveEditor()
  return editor.document.lineAt(line - 1).text
}

// To remove a configuration value, use `undefined`.
export async function updateConfig(section: string, value: unknown) {
  const config = workspace.getConfiguration()
  await config.update(section, value, ConfigurationTarget.Global)
  await setTimeout(1000)
}

export async function getCompletionItems() {
  const { items }: { items: CompletionItem[] } = await commands.executeCommand(
    'vscode.executeCompletionItemProvider',
    window.activeTextEditor?.document.uri,
    window.activeTextEditor?.selection.active,
  )

  return items
}

export async function applyCompletionItem(item: CompletionItem | undefined) {
  if (!item) throw new Error('No completion item to apply.')

  const editor = getActiveEditor()

  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const textEdit = item.textEdit
  if (!textEdit) throw new Error('No text edit found to apply a completion item.')

  await editor.edit((editBuilder) => {
    editBuilder.replace(textEdit.range, textEdit.newText)
  })
}

export function assertLinkCompletionItems(
  items: CompletionItem[] | undefined,
  expectedItems: ExpectedLinkCompletionItem[],
) {
  assert(items, 'No completion items found.')

  for (const [index, expected] of expectedItems.entries()) {
    const item = items[index]
    assert(item, `No completion item found at index ${index}.`)

    if (expected.description) {
      assert(typeof item.label !== 'string', `Completion item label does not have description at index ${index}.`)

      const label: string = item.label.label
      assert.strictEqual(label, expected.link, `Completion item label is not '${expected.link}' at index ${index}.`)

      assert(item.label.description, `No completion item description found at index ${index}.`)
      const description: string = item.label.description
      assert.strictEqual(description, expected.description, `Completion item description mismatch at index ${index}.`)
    } else {
      assert(typeof item.label === 'string', `Completion item label has unexpected description at index ${index}.`)

      const label: string = item.label
      assert.strictEqual(label, expected.link, `Completion item label is not '${expected.link}' at index ${index}.`)
    }

    assert(item.kind === CompletionItemKind.File, `Completion item kind is not 'File' at index ${index}.`)

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const textEdit = item.textEdit
    assert(textEdit, `No text edit found in the completion item at index ${index}.`)

    const newText: string = textEdit.newText
    assert.strictEqual(
      newText,
      expected.link,
      `Completion item text edit new text is not '${expected.link}' at index ${index}.`,
    )
  }

  for (let i = expectedItems.length; i < items.length; i++) {
    const item = items[i]
    assert(item, `No completion item found at index ${i}.`)

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    assert(item.textEdit === undefined, `Unexpected text edit found in the completion item at index ${i}.`)
  }
}

function getActiveEditor() {
  const editor = window.activeTextEditor
  if (!editor) throw new Error('No active editor found.')
  return editor
}

interface ExpectedLinkCompletionItem {
  link: string
  description?: string
}
