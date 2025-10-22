import { spawnSync } from 'node:child_process'
import { globSync } from 'node:fs'
import path from 'node:path'
import { styleText } from 'node:util'

import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath, runTests } from '@vscode/test-electron'

import manifest from '../../../package.json'

async function run() {
  // The folder containing the Extension Manifest `package.json` passed to `--extensionDevelopmentPath`.
  const extensionDevelopmentPath = path.resolve(__dirname, '../../../')

  // Download VS Code and unzip it.
  const vscodeExecutablePath = await downloadAndUnzipVSCode(manifest.engines.vscode.slice(1))

  // Install the MDX extension.
  const [cliPath, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath)
  if (!cliPath) throw new Error('Failed to resolve the VS Code CLI path.')
  spawnSync(cliPath, [...args, '--force', '--install-extension', 'unifiedjs.vscode-mdx'], {
    encoding: 'utf8',
    stdio: 'inherit',
  })

  // All the tests per fixture.
  const testFixtures = globSync('*/', { cwd: __dirname })

  for (const testFixture of testFixtures) {
    /* eslint-disable no-console */
    console.info(styleText('yellow', '-'.repeat(80)))
    console.info(styleText('yellow', `Running tests for fixture: ${testFixture}`))
    console.info(styleText('yellow', '-'.repeat(80)))
    /* eslint-enable no-console */

    try {
      // The path to the extension test runner passed to `--extensionTestsPath`.
      const extensionTestsPath = path.resolve(__dirname, testFixture, 'index.js')

      // The path to the test workspace folder containing the fixtures and test file.
      const testWorkspace = path.resolve(__dirname, '..', 'fixtures', testFixture)
      const testFile = path.join(testWorkspace, 'src', 'content', 'docs', 'test.mdx')

      // Run the integration tests for this fixture.
      await runTests({
        extensionDevelopmentPath,
        extensionTestsPath,
        launchArgs: [testWorkspace, testFile],
        vscodeExecutablePath,
      })
    } catch (error) {
      logErrorAndExit(error)
    }
  }
}

function logErrorAndExit(error: unknown): void {
  console.error('Failed to run tests.')
  console.error(error)
  process.exit(1)
}

run().catch(logErrorAndExit)
