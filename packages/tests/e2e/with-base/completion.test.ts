import assert from 'node:assert/strict'

import { TestDefinitions } from '../definitions'
import { ExpectedRootFragmentCompletionItems, ExpectedRootLinkCompletionItems } from '../expectation'
import {
  activateExtension,
  applyCompletionItem,
  assertLinkCompletionItems,
  getCompletionItems,
  getLineText,
  moveCursor,
  revertFile,
  updateConfig,
  write,
  type ExpectedLinkCompletionItem,
} from '../utils'

suiteSetup(async () => {
  await activateExtension()
})

teardown(async () => {
  await revertFile()
})

function addBase(path: string) {
  return path.replace(/\//, '/docs/')
}

function addBaseToExpectedLinkCompletionItems(items: ExpectedLinkCompletionItem[]) {
  return items.map((item) => ({ ...item, link: addBase(item.link) }))
}

const definitions = TestDefinitions.map((definition) => ({
  ...definition,
  lineAfterLinkCompletion: addBase(definition.lineAfterLinkCompletion),
  lineAfterFragmentCompletion: addBase(definition.lineAfterFragmentCompletion),
}))

for (const definition of definitions) {
  suite(definition.name, () => {
    test(`provides link completions (${definition.name})`, async () => {
      moveCursor(definition.position[0], definition.position[1])

      const completions = await getCompletionItems()

      assertLinkCompletionItems(completions, addBaseToExpectedLinkCompletionItems(ExpectedRootLinkCompletionItems))

      await applyCompletionItem(completions[0])

      const text = getLineText(definition.position[0])

      assert.equal(text, definition.lineAfterLinkCompletion)
    })

    test('provides fragment completions', async () => {
      moveCursor(definition.position[0], definition.position[1])

      let completions = await getCompletionItems()
      await applyCompletionItem(completions[0])

      await write('#')

      completions = await getCompletionItems()

      assertLinkCompletionItems(completions, addBaseToExpectedLinkCompletionItems(ExpectedRootFragmentCompletionItems))

      await applyCompletionItem(completions[1])

      const text = getLineText(definition.position[0])

      assert.equal(text, definition.lineAfterFragmentCompletion)
    })
  })
}

test('provides custom link completions', async () => {
  const customComponentsSection = 'starlightLinks.customComponents'
  await updateConfig(customComponentsSection, undefined)

  const position = [31, 19] as const

  moveCursor(position[0], position[1])

  let completions = await getCompletionItems()

  assertLinkCompletionItems(completions, [])

  await updateConfig(customComponentsSection, [['CustomLink', 'url']])

  completions = await getCompletionItems()

  assertLinkCompletionItems(completions, addBaseToExpectedLinkCompletionItems(ExpectedRootLinkCompletionItems))

  await applyCompletionItem(completions[0])

  const text = getLineText(position[0])

  assert.equal(text, '<CustomLink url="/docs/achivi-amans/" />')

  await updateConfig(customComponentsSection, undefined)
})
