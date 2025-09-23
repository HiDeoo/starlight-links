const linkUrlRegex = /\[([^\]]*)\]\(([^)]*)$/

export function endsWithLinkUrl(text: string) {
  return linkUrlRegex.test(text)
}
