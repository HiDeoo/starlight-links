import { toString } from 'mdast-util-to-string'
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import { getNewSlugger } from 'starlight-links-shared/path.js'
import { visit } from 'unist-util-visit'

const linkUrlRegex = /\[(?:[^\]]*)\]\((?<link>[^)]*)$/

const processor = remark().use(remarkMdx) //.use(remarkHeadingId)

export function getPositionInfos(text: string): MarkdownPositionInfos {
  const match = linkUrlRegex.exec(text)
  if (!match?.groups) return { type: 'unknown' }

  const linkUrl = match.groups['link'] ?? ''
  const start = text.length - linkUrl.length

  if (!linkUrl.includes('#'))
    return {
      type: 'url',
      start,
      url: linkUrl,
    }

  const lastSlashIndex = linkUrl.lastIndexOf('/')

  return {
    type: 'fragment',
    start,
    url: linkUrl.slice(0, lastSlashIndex + 1),
  }
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

type MarkdownPositionInfos =
  | { type: 'unknown' }
  | {
      type: 'url'
      start: number
      url: string
    }
  | {
      type: 'fragment'
      start: number
      url: string
    }

export type MarkdownLinkPositionInfos = Exclude<MarkdownPositionInfos, { type: 'unknown' }>

interface MarkdownFragment {
  label?: string
  slug: string
}
