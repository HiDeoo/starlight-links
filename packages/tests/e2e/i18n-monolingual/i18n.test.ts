import { ExpectedRootFragmentCompletionItems, ExpectedRootLinkCompletionItems } from '../expectation'
import {
  activateExtension,
  applyCompletionItem,
  assertLinkCompletionItems,
  getCompletionItems,
  moveCursor,
  revertFile,
  write,
} from '../utils'

suiteSetup(async () => {
  await activateExtension()
})

teardown(async () => {
  await revertFile()
})

const position = [5, 18] as const

suite('root locale', () => {
  test(`provides link completions`, async () => {
    moveCursor(position[0], position[1])

    const completions = await getCompletionItems()

    assertLinkCompletionItems(completions, ExpectedRootLinkCompletionItems)
  })

  test('provides fragment completions', async () => {
    moveCursor(position[0], position[1])

    let completions = await getCompletionItems()
    await applyCompletionItem(completions[0])

    await write('#')

    completions = await getCompletionItems()

    assertLinkCompletionItems(completions, ExpectedRootFragmentCompletionItems)
  })
})
