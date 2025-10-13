import assert from 'node:assert/strict'

import {
  applyCompletionItem,
  assertLinkCompletionItems,
  getCompletionItems,
  getLineText,
  moveCursor,
  revertFile,
  write,
} from './utils'

teardown(async () => {
  await revertFile()
})

const definitions: TestDefinition[] = [
  {
    name: 'markdown link',
    position: [5, 18],
    lineAfterLinkCompletion: '[markdown-link](/achivi-amans/)',
    lineAfterFragmentCompletion: '[markdown-link](/achivi-amans/#magnum-eodem-nec)',
  },
  {
    name: 'html link',
    position: [7, 11],
    lineAfterLinkCompletion: '<a href="/achivi-amans/">html-link</a>',
    lineAfterFragmentCompletion: '<a href="/achivi-amans/#magnum-eodem-nec">html-link</a>',
  },
] as const

for (const definition of definitions) {
  suite(definition.name, () => {
    test(`provides link completions (${definition.name})`, async () => {
      moveCursor(definition.position[0], definition.position[1])

      const completions = await getCompletionItems()

      assertLinkCompletionItems(completions, [
        { link: '/achivi-amans/', description: 'Achivi amans' },
        { link: '/terrae/pertimuit-munere/', description: 'Pertimuit munere' },
      ])

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

      assertLinkCompletionItems(completions, [
        { link: '/achivi-amans/#_top' },
        { link: '/achivi-amans/#magnum-eodem-nec', description: 'Magnum eodem nec' },
        { link: '/achivi-amans/#nostris-sollerti-dedit', description: 'Nostris sollerti dedit' },
        { link: '/achivi-amans/#traharis-miserae', description: 'Traharis miserae' },
      ])

      await applyCompletionItem(completions[1])

      const text = getLineText(definition.position[0])

      assert.equal(text, definition.lineAfterFragmentCompletion)
    })
  })
}

interface TestDefinition {
  name: string
  position: [line: number, column: number]
  lineAfterLinkCompletion: string
  lineAfterFragmentCompletion: string
}
