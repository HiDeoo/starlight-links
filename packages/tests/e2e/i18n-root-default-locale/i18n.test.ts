import {
  ExpectedFrenchFallbackFragmentCompletionItems,
  ExpectedFrenchFragmentCompletionItems,
  ExpectedFrenchLinkCompletionItems,
  ExpectedRootFragmentCompletionItems,
  ExpectedRootLinkCompletionItems,
} from '../expectation'
import {
  applyCompletionItem,
  assertLinkCompletionItems,
  getCompletionItems,
  moveCursor,
  openContentFile,
  revertFile,
  write,
} from '../utils'

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

suite('non-root locale', () => {
  setup(async () => {
    await openContentFile('fr/test.mdx')
  })

  test(`provides link completions`, async () => {
    moveCursor(position[0], position[1])

    const completions = await getCompletionItems()

    assertLinkCompletionItems(completions, ExpectedFrenchLinkCompletionItems)
  })

  test('provides fragment completions', async () => {
    moveCursor(position[0], position[1])

    let completions = await getCompletionItems()
    await applyCompletionItem(completions[0])

    await write('#')

    completions = await getCompletionItems()

    assertLinkCompletionItems(completions, ExpectedFrenchFragmentCompletionItems)
  })

  test('provides fallback fragment completions', async () => {
    moveCursor(position[0], position[1])

    let completions = await getCompletionItems()
    await applyCompletionItem(completions[1])

    await write('#')

    completions = await getCompletionItems()

    assertLinkCompletionItems(completions, ExpectedFrenchFallbackFragmentCompletionItems)
  })
})
