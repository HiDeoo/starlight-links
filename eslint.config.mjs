import hideoo from '@hideoo/eslint-config'

export default hideoo([
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.mjs'],
        },
      },
    },
  },
])
