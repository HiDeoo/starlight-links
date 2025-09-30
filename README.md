<div align="center">
  <img alt="Starlight Links extension icon" src="https://i.imgur.com/7rk9CRx.png" width="128" />
  <h1>Starlight Links</h1>
</div>

<div align="center">
  <p><strong>IntelliSense for Starlight Markdown and MDX content links.</strong></p>
  <p>
    <a href="https://github.com/HiDeoo/starlight-links/actions/workflows/integration.yml">
      <img alt="Integration Status" src="https://github.com/HiDeoo/starlight-links/actions/workflows/integration.yml/badge.svg" />
    </a>
    <a href="https://github.com/HiDeoo/starlight-links/blob/main/LICENSE">
      <img alt="License" src="https://badgen.net/github/license/HiDeoo/starlight-links" />
    </a>
  </p>
</div>

## Features

Visual Studio Code extension providing IntelliSense for links in Markdown and MDX files for [Starlight](https://starlight.astro.build/) documentation projects.

> [!NOTE]  
> The Starlight Links extension is currently in early preview and more features will be added in the future.

- Link completions for internal links and fragments:

  <a href="https://i.imgur.com/xYQxHa2.png" title="Screenshot of the Starlight Links extension link completions">
    <img alt="Screenshot of the Starlight Links extension link completions" src="https://i.imgur.com/xYQxHa2.png" width="675" />
  </a>

  <a href="https://i.imgur.com/BwFRbuq.png" title="Screenshot of the Starlight Links extension fragment completions">
    <img alt="Screenshot of the Starlight Links extension fragment completions" src="https://i.imgur.com/BwFRbuq.png" width="675" />
  </a>

- Go to definition and follow internal links:

  <a href="https://i.imgur.com/UTozPa7.gif" title="Preview of the Starlight Links extension go to definition feature">
    <img alt="Preview of the Starlight Links extension go to definition feature" src="https://i.imgur.com/UTozPa7.gif" width="675" />
  </a>

- Hover internal links:

  <a href="https://i.imgur.com/2ujV5MM.png" title="Screenshot of the Starlight Links extension hover feature">
    <img alt="Screenshot of the Starlight Links extension hover feature" src="https://i.imgur.com/2ujV5MM.png" width="675" />
  </a>

## Configuration

### `starlightLinks.configDirectories`

By default, the Starlight Links extension will look for Starlight configuration files located either at the root of the workspace or in a `docs/` subdirectory.

You can customize the directories where the extension will look for Starlight configuration files in your Visual Studio Code [User](https://code.visualstudio.com/docs/getstarted/settings#_settings-editor) or [Workspace](https://code.visualstudio.com/docs/getstarted/settings#_workspace-settings) settings.

```json
{
  "starlightLinks.configDirectories": [".", "./docs", "./app", "./packages/docs"]
}
```

### `starlightLinks.useConsistentLocale`

In multilingual documentation projects, the Starlight Links extension will, by default, limit internal link completions to the locale of the currently opened file.

You can disable this behavior and always show all internal links regardless of the locale in your Visual Studio Code [User](https://code.visualstudio.com/docs/getstarted/settings#_settings-editor) or [Workspace](https://code.visualstudio.com/docs/getstarted/settings#_workspace-settings) settings.

```json
{
  "starlightLinks.useConsistentLocale": false
}
```

## More extensions

- [Toggler](https://marketplace.visualstudio.com/items?itemName=hideoo.toggler) - Toggle words and symbols.
- [Create](https://marketplace.visualstudio.com/items?itemName=hideoo.create) - Quickly create new File(s) & Folder(s).
- [Trailing](https://marketplace.visualstudio.com/items?itemName=hideoo.trailing) - Toggle trailing symbols: commas, semicolons and colons.
- [Starlight i18n](https://marketplace.visualstudio.com/items?itemName=hideoo.starlight-i18n) - Easily translate Starlight documentation pages.

## License

Licensed under the MIT License, Copyright © HiDeoo.

See [LICENSE](https://github.com/HiDeoo/starlight-links/blob/main/LICENSE) for more information.
