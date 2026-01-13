# starlight-links

## 0.3.1

### Patch Changes

- [#17](https://github.com/HiDeoo/starlight-links/pull/17) [`b73281b`](https://github.com/HiDeoo/starlight-links/commit/b73281b1a7c94757fb44fc6bb2abcdc0093e3165) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes an issue generating invalid link completions in projects using the Astro `base` configuration option.

## 0.3.0

### Minor Changes

- [#14](https://github.com/HiDeoo/starlight-links/pull/14) [`8a15ac4`](https://github.com/HiDeoo/starlight-links/commit/8a15ac40adeb32c66c6efba688f6854c9c51be72) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds support for navigating to the specific line in a content page where a heading is located when using the "Go to Definition" feature on internal links with fragments.

- [#11](https://github.com/HiDeoo/starlight-links/pull/11) [`966651e`](https://github.com/HiDeoo/starlight-links/commit/966651e0c4a1dd5a25c1424293e0d2578afe1f78) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds suport for imported Starlight i18n configuration ([`locales`](https://starlight.astro.build/reference/configuration/#locales)) object.

- [#13](https://github.com/HiDeoo/starlight-links/pull/13) [`9cfce59`](https://github.com/HiDeoo/starlight-links/commit/9cfce59ba81be3496e2bac8b06eff00fac7a417e) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds IntelliSense support for [previous page links](https://starlight.astro.build/reference/frontmatter/#prev), [next page links](https://starlight.astro.build/reference/frontmatter/#next), and [hero action links](https://starlight.astro.build/reference/frontmatter/#hero) in frontmatter.

- [#15](https://github.com/HiDeoo/starlight-links/pull/15) [`5b07f99`](https://github.com/HiDeoo/starlight-links/commit/5b07f99a17ab28c1c8c6d613032aaa7ca2a748bd) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds Firebase Studio support.

  This change required lowering the minimum supported VS Code version and shipping the extension in CommonJS instead of the ES Module format.

- [#14](https://github.com/HiDeoo/starlight-links/pull/14) [`8a15ac4`](https://github.com/HiDeoo/starlight-links/commit/8a15ac40adeb32c66c6efba688f6854c9c51be72) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds support for navigating to the specific line in a content page where a heading is located when following internal links with fragments.

### Patch Changes

- [#14](https://github.com/HiDeoo/starlight-links/pull/14) [`8a15ac4`](https://github.com/HiDeoo/starlight-links/commit/8a15ac40adeb32c66c6efba688f6854c9c51be72) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes an issue where internal link hovers could display incorrect information after editing the title or the description of a content page.

- [#9](https://github.com/HiDeoo/starlight-links/pull/9) [`848e055`](https://github.com/HiDeoo/starlight-links/commit/848e0556a34f16037b08804aed142e717f319053) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes an issue generating invalid link completions in multilingual projects with no root locale.

- [#11](https://github.com/HiDeoo/starlight-links/pull/11) [`966651e`](https://github.com/HiDeoo/starlight-links/commit/966651e0c4a1dd5a25c1424293e0d2578afe1f78) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes Starlight i18n configuration object parsing issue when such object is using the `satisfies` TypeScript operator.

## 0.2.1

### Patch Changes

- [#7](https://github.com/HiDeoo/starlight-links/pull/7) [`6e951c8`](https://github.com/HiDeoo/starlight-links/commit/6e951c8257d0941b89bc9616a9eec95f901f5a52) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes a potential Starlight configuration parsing issue.

## 0.2.0

### Minor Changes

- [#5](https://github.com/HiDeoo/starlight-links/pull/5) [`6861fd4`](https://github.com/HiDeoo/starlight-links/commit/6861fd421f7b3b4ef9be39379164bf1be82cb959) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds IntelliSense support for Starlight `<LinkCard>` and `<LinkButton>` components.

- [#5](https://github.com/HiDeoo/starlight-links/pull/5) [`6861fd4`](https://github.com/HiDeoo/starlight-links/commit/6861fd421f7b3b4ef9be39379164bf1be82cb959) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds IntelliSense support for Markdown reference links.

- [#5](https://github.com/HiDeoo/starlight-links/pull/5) [`6861fd4`](https://github.com/HiDeoo/starlight-links/commit/6861fd421f7b3b4ef9be39379164bf1be82cb959) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds IntelliSense support for additional custom components configurable using the [`starlightLinks.customComponents` setting](https://github.com/HiDeoo/starlight-links#starlightlinkscustomcomponents).

  ```jsonc
  {
    "starlightLinks.customComponents": [
      // Add support for a `<CustomLink url="…">` component.
      ["CustomLink", "url"],
    ],
  }
  ```

- [#5](https://github.com/HiDeoo/starlight-links/pull/5) [`6861fd4`](https://github.com/HiDeoo/starlight-links/commit/6861fd421f7b3b4ef9be39379164bf1be82cb959) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds IntelliSense support for [fallback content](https://starlight.astro.build/guides/i18n/#fallback-content) links in multilingual sites.

- [#5](https://github.com/HiDeoo/starlight-links/pull/5) [`6861fd4`](https://github.com/HiDeoo/starlight-links/commit/6861fd421f7b3b4ef9be39379164bf1be82cb959) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds IntelliSense support for HTML links.

## 0.1.1

### Patch Changes

- [#3](https://github.com/HiDeoo/starlight-links/pull/3) [`5ee7ac9`](https://github.com/HiDeoo/starlight-links/commit/5ee7ac91da14760ab4a7c936aebd900bdba5751d) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Prevents notifications when parsing malformed Markdown files.

## 0.1.0

### Minor Changes

- [#1](https://github.com/HiDeoo/starlight-links/pull/1) [`bb254ae`](https://github.com/HiDeoo/starlight-links/commit/bb254ae1e94322d6dece68b3ea36a4caf1c750a0) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Initial public release
