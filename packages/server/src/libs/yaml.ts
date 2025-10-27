import matter from 'gray-matter'
import { isMap, isScalar, isSeq, LineCounter, parseDocument, visit, type Range, type Scalar } from 'yaml'

import type { Points } from './markdown'

export function getStarlightFrontmatter(markdown: string) {
  return matter(markdown).data as StarlightFrontmatter
}

export function getStarlightFrontmatterLinks(yaml: string) {
  const starlightFrontmatterLinks: StarlightFrontmatterLink[] = []

  const lineCounter = new LineCounter()
  const doc = parseDocument(yaml, { lineCounter })

  visit(doc, {
    Pair: (_, node) => {
      if (!isStringScalar(node.key)) return visit.SKIP

      switch (node.key.value) {
        case 'next':
        case 'prev': {
          const link = getMapPropertyValue(node.value, 'link')
          if (!link || !isStringScalar(link) || !link.range) return visit.SKIP

          starlightFrontmatterLinks.push(makeStarlightFrontmatterLink(link.value, link.range, lineCounter))

          return visit.SKIP
        }
        case 'hero': {
          const actions = getMapPropertyValue(node.value, 'actions')
          if (!actions || !isSeq(actions)) return visit.SKIP

          for (const action of actions.items) {
            const link = getMapPropertyValue(action, 'link')
            if (!link || !isStringScalar(link) || !link.range) continue

            starlightFrontmatterLinks.push(makeStarlightFrontmatterLink(link.value, link.range, lineCounter))

            return visit.SKIP
          }
        }
      }

      return visit.SKIP
    },
  })

  return starlightFrontmatterLinks
}

function makeStarlightFrontmatterLink(url: string, range: Range, lineCounter: LineCounter): StarlightFrontmatterLink {
  const [start, end] = range

  const startPos = lineCounter.linePos(start)
  const endPos = lineCounter.linePos(end)

  return {
    url,
    start: { line: startPos.line + 1, column: startPos.col },
    end: { line: endPos.line + 1, column: endPos.col },
  }
}

function getMapPropertyValue(node: unknown, key: string): unknown {
  if (!isMap(node)) return

  for (const property of node.items) {
    if (!isStringScalar(property.key) || property.key.value !== key) continue

    return property.value
  }

  return
}

function isStringScalar(node: unknown): node is Scalar & { value: string } {
  return isScalar(node) && typeof node.value === 'string'
}

interface StarlightFrontmatter {
  title: string
  description?: string
  slug?: string
}

interface StarlightFrontmatterLink extends Points {
  url: string
}
