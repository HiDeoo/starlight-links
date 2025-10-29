import assert from 'node:assert/strict'

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
} from '../utils'

suiteSetup(async () => {
  await activateExtension()
})

teardown(async () => {
  await revertFile()
})

const definitions: TestDefinition[] = [
  {
    name: 'frontmatter prev link',
    position: [4, 10],
    lineAfterLinkCompletion: '  link: /achivi-amans/',
    lineAfterFragmentCompletion: '  link: /achivi-amans/#magnum-eodem-nec',
  },
  {
    name: 'frontmatter next link',
    position: [7, 10],
    lineAfterLinkCompletion: '  link: /achivi-amans/',
    lineAfterFragmentCompletion: '  link: /achivi-amans/#magnum-eodem-nec',
  },
  {
    name: 'frontmatter action link',
    position: [12, 14],
    lineAfterLinkCompletion: '      link: /achivi-amans/',
    lineAfterFragmentCompletion: '      link: /achivi-amans/#magnum-eodem-nec',
  },
  {
    name: 'markdown link',
    position: [15, 18],
    lineAfterLinkCompletion: '[markdown-link](/achivi-amans/)',
    lineAfterFragmentCompletion: '[markdown-link](/achivi-amans/#magnum-eodem-nec)',
  },
  {
    name: 'markdown reference link',
    position: [19, 16],
    lineAfterLinkCompletion: '[definition]: /achivi-amans/',
    lineAfterFragmentCompletion: '[definition]: /achivi-amans/#magnum-eodem-nec',
  },
  {
    name: 'html link',
    position: [21, 11],
    lineAfterLinkCompletion: '<a href="/achivi-amans/">html-link</a>',
    lineAfterFragmentCompletion: '<a href="/achivi-amans/#magnum-eodem-nec">html-link</a>',
  },
  {
    name: 'linkcard link',
    position: [26, 41],
    lineAfterLinkCompletion: '	<LinkCard title="linkcard-link" href="/achivi-amans/" />',
    lineAfterFragmentCompletion: '	<LinkCard title="linkcard-link" href="/achivi-amans/#magnum-eodem-nec" />',
  },
  {
    name: 'linkbutton link',
    position: [29, 20],
    lineAfterLinkCompletion: '<LinkButton href="/achivi-amans/">linkbutton-link</LinkButton>',
    lineAfterFragmentCompletion: '<LinkButton href="/achivi-amans/#magnum-eodem-nec">linkbutton-link</LinkButton>',
  },
] as const

for (const definition of definitions) {
  suite(definition.name, () => {
    test(`provides link completions (${definition.name})`, async () => {
      moveCursor(definition.position[0], definition.position[1])

      const completions = await getCompletionItems()

      assertLinkCompletionItems(completions, ExpectedRootLinkCompletionItems)

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

      assertLinkCompletionItems(completions, ExpectedRootFragmentCompletionItems)

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

  assertLinkCompletionItems(completions, ExpectedRootLinkCompletionItems)

  await applyCompletionItem(completions[0])

  const text = getLineText(position[0])

  assert.equal(text, '<CustomLink url="/achivi-amans/" />')

  await updateConfig(customComponentsSection, undefined)
})

interface TestDefinition {
  name: string
  position: [line: number, column: number]
  lineAfterLinkCompletion: string
  lineAfterFragmentCompletion: string
}
