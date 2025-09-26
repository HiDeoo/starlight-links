import matter from 'gray-matter'
import type { MdxJsxAttribute, MdxJsxExpressionAttribute } from 'mdast-util-mdx-jsx'
import { toString } from 'mdast-util-to-string'
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import { getNewSlugger } from 'starlight-links-shared/path.js'
import { pointEnd, pointStart } from 'unist-util-position'
import { CONTINUE, SKIP, visit } from 'unist-util-visit'
import type { Position, TextDocumentPositionParams } from 'vscode-languageserver/node'
import type { TextDocument } from 'vscode-languageserver-textdocument'

const processor = remark().use(remarkMdx).freeze()

const linkUrlRegex = /(?<prefix>\[(?:[^\]]*)\]\(\s*<?)(?<url>[^>\s]*)>?\s*\)/

export function getStarlightLinkAtPosition(document: TextDocument, { position }: TextDocumentPositionParams) {
  for (const link of getStarlightLinks(document)) {
    if (position.line !== link.start.line || position.line !== link.end.line) continue
    if (position.character < link.start.character || position.character > link.end.character) continue

    return link
  }

  return
}

export function getStarlightLinks(document: TextDocument) {
  const markdown = document.getText()
  const tree = processor.parse(markdown)
  const starlightLinks: StarlightLink[] = []

  visit(tree, ['link'], (node) => {
    if (node.type !== 'link') return CONTINUE
    if (node.url.startsWith('#')) return SKIP

    const start = pointStart(node)
    const end = pointEnd(node)
    if (!start || !end) return SKIP

    const urlPosition = getLinkUrlPosition(markdown, start, end)
    if (!urlPosition) return SKIP

    starlightLinks.push({
      url: node.url,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      slug: node.url.includes('#') ? node.url.split('#')[0]! : node.url,
      start: getPositionFromPoint(urlPosition.start),
      end: getPositionFromPoint(urlPosition.end),
    })

    return SKIP
  })

  return starlightLinks
}

export function getStarlightFrontmatter(markdown: string) {
  return matter(markdown).data as StarlightFrontmatter
}

// TODO(HiDeoo) markdown references

function getLinkUrlPosition(markdown: string, start: Point, end: Point): { start: Point; end: Point } | undefined {
  const linkStr = markdown.slice(start.offset, end.offset)

  const match = linkUrlRegex.exec(linkStr)
  const prefix = match?.groups?.['prefix']
  const url = match?.groups?.['url']
  if (!prefix || url === undefined) return

  const urlStart = { line: start.line, column: start.column + prefix.length }
  const urlEnd = { line: start.line, column: urlStart.column + url.length }

  return { start: urlStart, end: urlEnd }
}

export function getFragments(content: string): MarkdownFragment[] {
  const tree = processor.parse(content)
  const slugger = getNewSlugger()

  const fragments: MarkdownFragment[] = [{ slug: '_top' }]

  visit(tree, ['heading', 'html', 'mdxJsxFlowElement', 'mdxJsxTextElement'], (node) => {
    // https://github.com/syntax-tree/mdast#nodes
    // https://github.com/syntax-tree/mdast-util-mdx-jsx#nodes
    switch (node.type) {
      case 'heading': {
        const content = toString(node)
        if (content.length === 0) break

        // Remove the last trailing hyphen from the slug like Astro does if it exists.
        // https://github.com/withastro/astro/blob/74ee2e45ecc9edbe285eadee6d0b94fc47d0d125/packages/integrations/markdoc/src/heading-ids.ts#L21
        fragments.push({ label: content, slug: slugger.slug(content).replace(/-$/, '') })

        break
      }
      case 'mdxJsxFlowElement': {
        for (const attribute of node.attributes) {
          if (isMdxIdAttribute(attribute)) {
            fragments.push({ slug: attribute.value })
            break
          }
        }

        break
      }
      case 'mdxJsxTextElement': {
        for (const attribute of node.attributes) {
          if (isMdxIdAttribute(attribute)) {
            fragments.push({ slug: attribute.value })
            break
          }
        }

        break
      }
    }
  })

  return fragments
}

function getPositionFromPoint(point: Point): Position {
  return { line: point.line - 1, character: point.column - 1 }
}

function isMdxIdAttribute(attribute: MdxJsxAttribute | MdxJsxExpressionAttribute): attribute is MdxIdAttribute {
  return (
    attribute.type === 'mdxJsxAttribute' &&
    attribute.name === 'id' &&
    typeof attribute.value === 'string' &&
    attribute.value.length > 0
  )
}

type Point = NonNullable<ReturnType<typeof pointStart>>

interface MdxIdAttribute {
  name: 'id'
  type: 'mdxJsxAttribute'
  value: string
}

interface MarkdownFragment {
  label?: string
  slug: string
}

interface StarlightLink {
  url: string
  slug: string
  start: Position
  end: Position
}

interface StarlightFrontmatter {
  title: string
  description?: string
  slug?: string
}
