import path from 'node:path'

import { runTests } from '@vscode/test-electron'

import manifest from '../../../package.json'

async function run() {
  try {
    // The folder containing the Extension Manifest `package.json` passed to `--extensionDevelopmentPath`.
    const extensionDevelopmentPath = path.resolve(__dirname, '../../../')

    // The path to the extension test runner passed to `--extensionTestsPath`.
    const extensionTestsPath = path.resolve(__dirname, 'runner.js')

    // The path to the test workspace folder containing the fixtures and test file.
    const testWorkspace = path.resolve(__dirname, '../fixtures/basics')
    const testFile = path.join(testWorkspace, 'src/content/docs/test.md')

    // Download VS Code, unzip it and run the integration tests.
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: ['--disable-extensions', testWorkspace, testFile],
      version: manifest.engines.vscode.slice(1),
    })
  } catch (error) {
    logErrorAndExit(error)
  }
}

function logErrorAndExit(error: unknown): void {
  console.error('Failed to run tests.')
  console.error(error)
  process.exit(1)
}

run().catch(logErrorAndExit)
