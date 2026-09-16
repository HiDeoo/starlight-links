import hideoo from '@hideoo/eslint-config'

export default hideoo([
  {
    languageOptions: {
      parserOptions: {
        project: false,
        projectService: {
          allowDefaultProject: ['*.mjs'],
        },
      },
    },
  },
  {
    ignores: ['packages/tests/fixtures/**'],
  },
])
