import {
  ExpectedEnglishFragmentCompletionItems,
  ExpectedEnglishLinkCompletionItems,
  ExpectedFrenchFallbackFragmentCompletionItems,
  ExpectedFrenchFragmentCompletionItems,
  ExpectedFrenchLinkCompletionItems,
} from '../expectation'
import {
  activateExtension,
  applyCompletionItem,
  assertLinkCompletionItems,
  getCompletionItems,
  moveCursor,
  openContentFile,
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

suite('non-root default locale', () => {
  setup(async () => {
    await openContentFile('en/test.mdx')
  })

  test(`provides link completions`, async () => {
    moveCursor(position[0], position[1])

    const completions = await getCompletionItems()

    assertLinkCompletionItems(completions, ExpectedEnglishLinkCompletionItems)
  })

  test('provides fragment completions', async () => {
    moveCursor(position[0], position[1])

    let completions = await getCompletionItems()
    await applyCompletionItem(completions[0])

    await write('#')

    completions = await getCompletionItems()

    assertLinkCompletionItems(completions, ExpectedEnglishFragmentCompletionItems)
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
