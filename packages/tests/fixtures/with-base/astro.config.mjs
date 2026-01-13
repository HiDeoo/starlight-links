import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

export default defineConfig({
  base: '/docs',
  integrations: [
    starlight({
      title: 'With base',
    }),
  ],
})
