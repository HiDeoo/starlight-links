import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

export default defineConfig({
  integrations: [
    starlight({
      title: 'i18n monolingual',
      locales: {
        root: { label: 'French', lang: 'fr' },
      },
    }),
  ],
})
