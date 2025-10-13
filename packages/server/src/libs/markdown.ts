import matter from 'gray-matter'
import type { MdxJsxAttribute, MdxJsxExpressionAttribute } from 'mdast-util-mdx-jsx'
import { toString } from 'mdast-util-to-string'
import { remark } from 'remark'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdx from 'remark-mdx'
import { getNewSlugger } from 'starlight-links-shared/path.js'
import { pointEnd, pointStart } from 'unist-util-position'
import { CONTINUE, SKIP, visit } from 'unist-util-visit'
import type { Position, TextDocumentPositionParams } from 'vscode-languageserver/node'
import type { TextDocument } from 'vscode-languageserver-textdocument'

const processor = remark().use(remarkMdx).use(remarkFrontmatter).freeze()

const markdownLinkUrlRegex = /(?<prefix>\[(?:[^\]]*)\]\(\s*<?)(?<url>[^>\s]*)>?\s*\)/
const markdownDefinitionUrlRegex = /(?<prefix>\[(?:[^\]]*)\]: <?)(?<url>[^>\s]*)/
const htmlAttributeValueRegex =
  /^(?<prefix>[^\s=>]+=)(?:(?<quotes>['"])(?<quotedValue>[^'"]*?)\2|(?<unquotedValue>[^\s'">]*))$/

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
  const starlightLinks: StarlightLink[] = []

  try {
    const tree = processor.parse(markdown)

    visit(tree, ['definition', 'link', 'mdxJsxFlowElement', 'mdxJsxTextElement'], (node) => {
      // https://github.com/syntax-tree/mdast#nodes
      // https://github.com/syntax-tree/mdast-util-mdx-jsx#nodes
      switch (node.type) {
        case 'definition': {
          if (node.url.startsWith('#')) return SKIP

          const urlPoints = getMarkdownDefinitionUrlPosition(markdown, node)
          if (!urlPoints) return SKIP

          starlightLinks.push(makeStarlightLink(node.url, urlPoints))

          return SKIP
        }
        case 'link': {
          if (node.url.startsWith('#')) return SKIP

          const urlPoints = getMarkdownLinkUrlPosition(markdown, node)
          if (!urlPoints) return SKIP

          starlightLinks.push(makeStarlightLink(node.url, urlPoints))

          return SKIP
        }
        case 'mdxJsxFlowElement':
        case 'mdxJsxTextElement': {
          if (node.name !== 'a' && node.name !== 'LinkCard' && node.name !== 'LinkButton') return CONTINUE

          const href = node.attributes.find((attr) => attr.type === 'mdxJsxAttribute' && attr.name === 'href')
          if (!href || typeof href.value !== 'string') return SKIP
          if (href.value.startsWith('#')) return SKIP

          const urlPoints = getHtmlAttributeValuePosition(markdown, href)
          if (!urlPoints) return SKIP

          starlightLinks.push(makeStarlightLink(href.value, urlPoints))

          return SKIP
        }
        default: {
          return CONTINUE
        }
      }
    })
  } catch {
    // Ignore parsing errors.
  }

  return starlightLinks
}

function makeStarlightLink(url: string, points: Points): StarlightLink {
  return {
    url,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    slug: url.includes('#') ? url.split('#')[0]! : url,
    start: getPositionFromPoint(points.start),
    end: getPositionFromPoint(points.end),
  }
}

export function getStarlightFrontmatter(markdown: string) {
  return matter(markdown).data as StarlightFrontmatter
}

function getMarkdownLinkUrlPosition(markdown: string, node: Node): Points | undefined {
  const points = getNodePoints(node)
  if (!points) return
  const { start, end } = points

  const linkStr = markdown.slice(start.offset, end.offset)

  const match = markdownLinkUrlRegex.exec(linkStr)
  const prefix = match?.groups?.['prefix']
  const url = match?.groups?.['url']
  if (!prefix || url === undefined) return

  const urlStart = { line: start.line, column: start.column + prefix.length }
  const urlEnd = { line: start.line, column: urlStart.column + url.length }

  return { start: urlStart, end: urlEnd }
}

function getMarkdownDefinitionUrlPosition(markdown: string, node: Node): Points | undefined {
  const points = getNodePoints(node)
  if (!points) return
  const { start, end } = points

  const definitionStr = markdown.slice(start.offset, end.offset)

  const match = markdownDefinitionUrlRegex.exec(definitionStr)
  const prefix = match?.groups?.['prefix']
  const url = match?.groups?.['url']
  if (!prefix || url === undefined) return

  const urlStart = { line: start.line, column: start.column + prefix.length }
  const urlEnd = { line: start.line, column: urlStart.column + url.length }

  return { start: urlStart, end: urlEnd }
}

function getHtmlAttributeValuePosition(html: string, node: Node): Points | undefined {
  const points = getNodePoints(node)
  if (!points) return
  const { start, end } = points

  const attributeStr = html.slice(start.offset, end.offset)

  const match = htmlAttributeValueRegex.exec(attributeStr)
  const prefix = match?.groups?.['prefix']
  const value = match?.groups?.['quotedValue'] ?? match?.groups?.['unquotedValue']
  const isQuoted = match?.groups?.['quotedValue'] !== undefined
  if (!prefix || value === undefined) return

  const urlStart = { line: start.line, column: start.column + prefix.length + (isQuoted ? 1 : 0) }
  const urlEnd = { line: start.line, column: urlStart.column + value.length }

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

function getNodePoints(node: Node) {
  const start = pointStart(node)
  const end = pointEnd(node)
  if (!start || !end) return undefined
  return { start, end }
}

function isMdxIdAttribute(attribute: MdxJsxAttribute | MdxJsxExpressionAttribute): attribute is MdxIdAttribute {
  return (
    attribute.type === 'mdxJsxAttribute' &&
    attribute.name === 'id' &&
    typeof attribute.value === 'string' &&
    attribute.value.length > 0
  )
}

type Node = Parameters<typeof pointStart>[0]

type Point = NonNullable<ReturnType<typeof pointStart>>

interface Points {
  start: Point
  end: Point
}

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
