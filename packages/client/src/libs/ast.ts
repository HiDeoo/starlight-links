import { parse, type ParseResult } from '@babel/parser'
import babelTraverse from '@babel/traverse'
import {
  isArrayExpression,
  isCallExpression,
  isExportNamedDeclaration,
  isIdentifier,
  isImportDeclaration,
  isObjectExpression,
  isObjectProperty,
  isStringLiteral,
  isTSSatisfiesExpression,
  isVariableDeclaration,
  type Identifier,
  type ImportDeclaration,
  type ObjectExpression,
  type ObjectProperty,
  type Program,
  type StringLiteral,
} from '@babel/types'
import { stripLeadingSlash, stripTrailingSlash } from 'starlight-links-shared/path.js'
import type { StarlightConfig, StarlightProject } from 'starlight-links-shared/starlight.js'

// @ts-expect-error - https://github.com/babel/babel/discussions/13093
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const traverse: typeof babelTraverse = babelTraverse.default ?? babelTraverse

export function getStarlightProjectFromConfig(code: string, fileReader: FileReader) {
  let ast: ParseResult

  try {
    ast = parseCode(code)
    if (ast.errors && ast.errors.length > 0) throw new Error(JSON.stringify(ast.errors))
  } catch (error) {
    throw new Error(
      `Failed to parse Astro configuration file: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return getStarlightProject(ast.program, fileReader)
}

function parseCode(code: string) {
  return parse(code, { sourceType: 'unambiguous', plugins: ['typescript'] })
}

async function getStarlightProject(program: Program, fileReader: FileReader): Promise<StarlightProject> {
  let astroConfigAst: ObjectExpression | undefined
  let starlightConfigAst: ObjectExpression | undefined

  traverse(program, {
    noScope: true,
    ExportDefaultDeclaration(path) {
      if (!isCallExpression(path.node.declaration)) {
        throw new Error(
          'The default export of the Astro configuration file must be a call to the `defineConfig` function.',
        )
      }

      const configAst = path.node.declaration.arguments[0]

      if (!isObjectExpression(configAst)) {
        throw new Error(
          'The first argument of the `defineConfig` function must be an object containing the Astro configuration.',
        )
      }

      astroConfigAst = configAst

      const astroIntegrations = astroConfigAst.properties.find(
        (property) =>
          isObjectProperty(property) &&
          ((isIdentifier(property.key) && property.key.name === 'integrations') ||
            (isStringLiteral(property.key) && property.key.value === 'integrations')),
      )

      if (!astroIntegrations || !isObjectProperty(astroIntegrations) || !isArrayExpression(astroIntegrations.value)) {
        throw new Error('The Astro configuration must contain an `integrations` property that must be an array.')
      }

      const starlightIntegration = astroIntegrations.value.elements.find(
        (element) => isCallExpression(element) && isIdentifier(element.callee) && element.callee.name === 'starlight',
      )

      if (!starlightIntegration || !isCallExpression(starlightIntegration)) {
        throw new Error('Failed to find the `starlight` integration in the Astro configuration.')
      }

      const config = starlightIntegration.arguments[0]

      if (!isObjectExpression(config)) {
        throw new Error(
          'The first argument of the `starlight` integration must be an object containing the Starlight configuration.',
        )
      }

      starlightConfigAst = config
    },
  })

  if (!astroConfigAst || !starlightConfigAst) {
    throw new Error('Failed to find Starlight configuration in the Astro configuration file.')
  }

  const defaultLocale = getStarlightDefaultLocaleConfig(starlightConfigAst)
  const locales = await getStarlightLocales(program, starlightConfigAst, fileReader)

  const base = getStringLiteralValueFromObjectExpression(program, astroConfigAst, 'base')
  const trailingSlash = getStringLiteralValueFromObjectExpression(program, astroConfigAst, 'trailingSlash')
  const srcDir = getStringLiteralValueFromObjectExpression(program, astroConfigAst, 'srcDir')

  const starlightProject: StarlightProject = {
    config: {
      isMultilingual: false,
    },
    context: {
      trailingSlash: (trailingSlash as StarlightProject['context']['trailingSlash'] | undefined) ?? 'ignore',
    },
  }

  if (defaultLocale) starlightProject.config.defaultLocale = defaultLocale

  if (locales) {
    starlightProject.config.locales = locales
    if (Object.keys(locales).length > 0) starlightProject.config.isMultilingual = true
  }

  if (base) starlightProject.context.base = stripLeadingSlash(stripTrailingSlash(base))
  if (srcDir) starlightProject.context.srcDir = srcDir

  return starlightProject
}

function getStarlightDefaultLocaleConfig(starlightConfig: ObjectExpression) {
  const defaultLocaleProperty = starlightConfig.properties.find(
    (property) =>
      isObjectProperty(property) &&
      ((isIdentifier(property.key) && property.key.name === 'defaultLocale') ||
        (isStringLiteral(property.key) && property.key.value === 'defaultLocale')),
  )

  return defaultLocaleProperty &&
    isObjectProperty(defaultLocaleProperty) &&
    isStringLiteral(defaultLocaleProperty.value) &&
    defaultLocaleProperty.value.value !== 'root'
    ? defaultLocaleProperty.value.value
    : undefined
}

async function getStarlightLocales(program: Program, starlightConfig: ObjectExpression, fileReader: FileReader) {
  const localesProperty = starlightConfig.properties.find(
    (property) =>
      isObjectProperty(property) &&
      ((isIdentifier(property.key) && property.key.name === 'locales') ||
        (isStringLiteral(property.key) && property.key.value === 'locales')),
  )

  if (
    !localesProperty ||
    !isObjectProperty(localesProperty) ||
    (!isObjectExpression(localesProperty.value) && !isIdentifier(localesProperty.value))
  ) {
    return
  }

  const localesObjectExpression = isIdentifier(localesProperty.value)
    ? await getObjectExpressionFromIdentifier(program, localesProperty.value, fileReader)
    : localesProperty.value

  if (!localesObjectExpression) {
    throw new Error('Failed to find valid `locales` configuration in Starlight configuration.')
  }

  const localesConfig: NonNullable<StarlightConfig['locales']> = {}

  for (const property of localesObjectExpression.properties) {
    if (!isObjectProperty(property)) continue

    const name = getObjectPropertyName(property)
    if (!name || name === 'root' || !isObjectExpression(property.value)) continue

    let localeLabel: string | undefined

    for (const localeProperty of property.value.properties) {
      if (!isObjectProperty(localeProperty)) continue

      const localePropertyName = getObjectPropertyName(localeProperty)

      if (localePropertyName === 'label' && isStringLiteral(localeProperty.value)) {
        localeLabel = localeProperty.value.value
        continue
      }
    }

    if (localeLabel) {
      localesConfig[name] = localeLabel
    }
  }

  return localesConfig
}

async function getObjectExpressionFromImportSpecifier(
  identifier: Identifier,
  importDeclaration: ImportDeclaration,
  fileReader: FileReader,
) {
  const source = importDeclaration.source.value

  if (!source.startsWith('.')) {
    throw new Error(`Failed to resolve imported Starlight configuration from non-relative module \`${source}\`.`)
  }

  const code = await fileReader(source)
  const ast = parseCode(code)

  return getObjectExpressionFromIdentifier(ast.program, identifier, fileReader)
}

async function getObjectExpressionFromIdentifier(
  program: Program,
  identifier: Identifier,
  fileReader: FileReader,
): Promise<ObjectExpression | undefined> {
  let objectExpression: ObjectExpression | undefined

  for (const bodyNode of program.body) {
    if (isImportDeclaration(bodyNode)) {
      const identifierImportSpecifier = bodyNode.specifiers.find(
        (specifier) => isIdentifier(specifier.local) && specifier.local.name === identifier.name,
      )

      if (identifierImportSpecifier) {
        return getObjectExpressionFromImportSpecifier(identifier, bodyNode, fileReader)
      }
    }

    const variableDeclaration = isVariableDeclaration(bodyNode)
      ? bodyNode
      : isExportNamedDeclaration(bodyNode) && isVariableDeclaration(bodyNode.declaration)
        ? bodyNode.declaration
        : undefined

    if (!variableDeclaration) {
      continue
    }

    for (const declaration of variableDeclaration.declarations) {
      if (isIdentifier(declaration.id) && declaration.id.name === identifier.name) {
        if (isObjectExpression(declaration.init)) {
          objectExpression = declaration.init
        } else if (isTSSatisfiesExpression(declaration.init) && isObjectExpression(declaration.init.expression)) {
          objectExpression = declaration.init.expression
        }
      }
    }
  }

  return objectExpression
}

function getStringLiteralFromIdentifier(program: Program, identifier: Identifier) {
  let stringLiteral: StringLiteral | undefined

  for (const bodyNode of program.body) {
    const variableDeclaration = isVariableDeclaration(bodyNode)
      ? bodyNode
      : isExportNamedDeclaration(bodyNode) && isVariableDeclaration(bodyNode.declaration)
        ? bodyNode.declaration
        : undefined

    if (!variableDeclaration) {
      continue
    }

    for (const declaration of variableDeclaration.declarations) {
      if (
        isIdentifier(declaration.id) &&
        declaration.id.name === identifier.name &&
        isStringLiteral(declaration.init)
      ) {
        stringLiteral = declaration.init
      }
    }
  }

  return stringLiteral
}

function getStringLiteralValueFromObjectExpression(
  program: Program,
  objectExpression: ObjectExpression,
  keyName: string,
) {
  const property = objectExpression.properties.find(
    (property) =>
      isObjectProperty(property) &&
      ((isIdentifier(property.key) && property.key.name === keyName) ||
        (isStringLiteral(property.key) && property.key.value === keyName)),
  )

  if (!property || !isObjectProperty(property) || (!isStringLiteral(property.value) && !isIdentifier(property.value))) {
    return
  }

  const stringLiteral = isIdentifier(property.value)
    ? getStringLiteralFromIdentifier(program, property.value)
    : property.value

  if (!stringLiteral) {
    throw new Error(`Failed to find valid \`${keyName}\` configuration in Starlight configuration.`)
  }

  return stringLiteral.value
}

function getObjectPropertyName(property: ObjectProperty) {
  return isIdentifier(property.key) ? property.key.name : isStringLiteral(property.key) ? property.key.value : undefined
}

type FileReader = (relativeFsPath: string) => Promise<string>
