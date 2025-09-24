const linkUrlRegex = /\[(?:[^\]]*)\]\((?<link>[^)]*)$/

export function getPositionInfos(text: string): MarkdownPositionInfos {
  const match = linkUrlRegex.exec(text)
  if (!match?.groups) return { isLinkUrl: false }
  const linkUrl = match.groups['link'] ?? ''
  return { isLinkUrl: true, linkUrl, linkUrlStart: text.length - linkUrl.length }
}

type MarkdownPositionInfos =
  | { isLinkUrl: false }
  | {
      isLinkUrl: true
      linkUrl: string
      linkUrlStart: number
    }
