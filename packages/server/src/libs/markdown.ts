import { toString } from 'mdast-util-to-string'
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import { getNewSlugger } from 'starlight-links-shared/path.js'
import { visit } from 'unist-util-visit'

const linkUrlRegex = /\[(?<text>[^\]]*)\]\((?<url>[^)]*)\)/g

const processor = remark().use(remarkMdx)

export function getMarkdownContentAtPosition(line: string, position: number): MarkdownContent {
  const links = getLineMarkdownLinks(line)

  for (const link of links) {
    if (position < link.start) continue
    if (position > link.end) continue

    return link
  }

  return { type: 'unknown' }
}

export function getMarkdownLinks(text: string): MarkdownLink[] {
  const links: MarkdownLink[] = []
  const lines = text.split('\n')

  for (const [index, line] of lines.entries()) {
    links.push(...getLineMarkdownLinks(line, index))
  }

  return links
}

function getLineMarkdownLinks(line: string, number = 0): MarkdownLink[] {
  const links: MarkdownLink[] = []

  let match: RegExpExecArray | null
  linkUrlRegex.lastIndex = 0

  while ((match = linkUrlRegex.exec(line))) {
    const start = match.index + (match[1]?.length ?? 0) + 3
    const end = start + (match[2]?.length ?? 0)
    const url = match[2] ?? ''

    if (url.includes('#')) {
      const [baseUrl] = url.split('#')

      links.push({
        type: 'fragment',
        line: number,
        start,
        end,
        url: baseUrl ?? '',
      })
    }

    links.push({
      type: 'url',
      line: number,
      start,
      end,
      url: url,
    })
  }

  return links
}

export function getFragments(content: string): MarkdownFragment[] {
  // TODO(HiDeoo) mdx
  // TODO(HiDeoo) html

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
        fragments.push({
          label: content,
          slug: slugger.slug(content).replace(/-$/, ''),
        })

        break
      }
      // case 'mdxJsxFlowElement': {
      //   for (const attribute of node.attributes) {
      //     if (isMdxIdAttribute(attribute)) {
      //       fileHeadings.push(attribute.value)
      //     }
      //   }

      //   if (!node.name) {
      //     break
      //   }

      //   const componentProp = linkComponents[node.name]

      //   if (node.name !== 'a' && !componentProp) {
      //     break
      //   }

      //   for (const attribute of node.attributes) {
      //     if (
      //       attribute.type !== 'mdxJsxAttribute' ||
      //       attribute.name !== (componentProp ?? 'href') ||
      //       typeof attribute.value !== 'string'
      //     ) {
      //       continue
      //     }

      //     const link = getLinkToValidate(attribute.value, config)
      //     if (link) fileLinks.push(link)
      //   }

      //   break
      // }
      // case 'mdxJsxTextElement': {
      //   for (const attribute of node.attributes) {
      //     if (isMdxIdAttribute(attribute)) {
      //       fileHeadings.push(attribute.value)
      //     }
      //   }

      //   break
      // }
      // case 'html': {
      //   const htmlTree = fromHtml(node.value, { fragment: true })

      //   visit(htmlTree, (htmlNode: Nodes) => {
      //     if (hasProperty(htmlNode, 'id') && typeof htmlNode.properties.id === 'string') {
      //       fileHeadings.push(htmlNode.properties.id)
      //     }

      //     if (
      //       htmlNode.type === 'element' &&
      //       htmlNode.tagName === 'a' &&
      //       hasProperty(htmlNode, 'href') &&
      //       typeof htmlNode.properties.href === 'string'
      //     ) {
      //       const link = getLinkToValidate(htmlNode.properties.href, config)
      //       if (link) fileLinks.push(link)
      //     }
      //   })

      //   break
      // }
    }
  })

  return fragments
}

type MarkdownContent =
  | { type: 'unknown' }
  | {
      type: 'url'
      line: number
      start: number
      end: number
      url: string
    }
  | {
      type: 'fragment'
      line: number
      start: number
      end: number
      url: string
    }

export type MarkdownLink = Exclude<MarkdownContent, { type: 'unknown' }>

interface MarkdownFragment {
  label?: string
  slug: string
}
