export const TestDefinitions: TestDefinition[] = [
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

interface TestDefinition {
  name: string
  position: [line: number, column: number]
  lineAfterLinkCompletion: string
  lineAfterFragmentCompletion: string
}
