import type { ExpectedLinkCompletionItem } from './utils'

export const ExpectedRootLinkCompletionItems: ExpectedLinkCompletionItem[] = [
  { link: '/achivi-amans/', description: 'Achivi amans' },
  { link: '/terrae/pertimuit-munere/', description: 'Pertimuit munere' },
]

export const ExpectedEnglishLinkCompletionItems: ExpectedLinkCompletionItem[] = [
  { link: '/en/achivi-amans/', description: 'Achivi amans' },
  { link: '/en/terrae/pertimuit-munere/', description: 'Pertimuit munere' },
]

export const ExpectedFrenchLinkCompletionItems: ExpectedLinkCompletionItem[] = [
  { link: '/fr/achivi-amans/', description: 'Achivi amans (fr)' },
  { link: '/fr/terrae/pertimuit-munere/', description: 'Pertimuit munere' },
]

export const ExpectedRootFragmentCompletionItems: ExpectedLinkCompletionItem[] = [
  { link: '/achivi-amans/#_top' },
  { link: '/achivi-amans/#magnum-eodem-nec', description: 'Magnum eodem nec' },
  { link: '/achivi-amans/#nostris-sollerti-dedit', description: 'Nostris sollerti dedit' },
  { link: '/achivi-amans/#traharis-miserae', description: 'Traharis miserae' },
]

export const ExpectedEnglishFragmentCompletionItems: ExpectedLinkCompletionItem[] = [
  { link: '/en/achivi-amans/#_top' },
  { link: '/en/achivi-amans/#magnum-eodem-nec', description: 'Magnum eodem nec' },
  { link: '/en/achivi-amans/#nostris-sollerti-dedit', description: 'Nostris sollerti dedit' },
  { link: '/en/achivi-amans/#traharis-miserae', description: 'Traharis miserae' },
]

export const ExpectedFrenchFragmentCompletionItems: ExpectedLinkCompletionItem[] = [
  { link: '/fr/achivi-amans/#_top' },
  { link: '/fr/achivi-amans/#magnum-eodem-nec-fr', description: 'Magnum eodem nec (fr)' },
  { link: '/fr/achivi-amans/#nostris-sollerti-dedit-fr', description: 'Nostris sollerti dedit (fr)' },
  { link: '/fr/achivi-amans/#traharis-miserae-fr', description: 'Traharis miserae (fr)' },
]

export const ExpectedFrenchFallbackFragmentCompletionItems: ExpectedLinkCompletionItem[] = [
  { link: '/fr/terrae/pertimuit-munere/#_top' },
  { link: '/fr/terrae/pertimuit-munere/#nec-loci-quicquid', description: 'Nec loci quicquid' },
  { link: '/fr/terrae/pertimuit-munere/#scelus-fumantis', description: 'Scelus fumantis' },
]

export const ExpectedMarkdownLinks = {
  AchiviAmans: '[markdown-link](/achivi-amans/)',
}
