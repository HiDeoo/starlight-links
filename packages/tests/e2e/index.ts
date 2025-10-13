import { spawnSync } from 'node:child_process'
import path from 'node:path'

import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath, runTests } from '@vscode/test-electron'

import manifest from '../../../package.json'

async function run() {
  try {
    // The folder containing the Extension Manifest `package.json` passed to `--extensionDevelopmentPath`.
    const extensionDevelopmentPath = path.resolve(__dirname, '../../../')

    // The path to the extension test runner passed to `--extensionTestsPath`.
    const extensionTestsPath = path.resolve(__dirname, 'runner.js')

    // The path to the test workspace folder containing the fixtures and test file.
    const testWorkspace = path.resolve(__dirname, '../fixtures/basics')
    const testFile = path.join(testWorkspace, 'src/content/docs/test.mdx')

    // Download VS Code and unzip it.
    const vscodeExecutablePath = await downloadAndUnzipVSCode(manifest.engines.vscode.slice(1))

    // Install the MDX extension.
    const [cliPath, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath)
    if (!cliPath) throw new Error('Failed to resolve the VS Code CLI path.')
    spawnSync(cliPath, [...args, '--install-extension', 'unifiedjs.vscode-mdx'], {
      encoding: 'utf8',
      stdio: 'inherit',
    })

    // Run the integration tests.
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

function logErrorAndExit(error: unknown): void {
  console.error('Failed to run tests.')
  console.error(error)
  process.exit(1)
}

run().catch(logErrorAndExit)
