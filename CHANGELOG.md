# starlight-links

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
