import { globSync } from 'node:fs'
import path from 'node:path'

import Mocha from 'mocha'

export function run(runner: string): Promise<void> {
  const rootDir = path.dirname(runner)

  return new Promise((resolve, reject) => {
    const mocha = new Mocha({
      color: true,
      ui: 'tdd',
      timeout: 10_000,
    })

    const files = globSync('**/**.test.js', { cwd: rootDir })

    for (const file of files) {
      mocha.addFile(path.resolve(rootDir, file))
    }

    try {
      mocha.run((failures) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`))
        } else {
          resolve()
        }
      })
    } catch (error) {
      console.error(error)
      reject(error instanceof Error ? error : new Error(String(error)))
    }
  })
}
