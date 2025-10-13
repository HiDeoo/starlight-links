import { globSync } from 'node:fs'
import path from 'node:path'

import Mocha from 'mocha'

export function run(): Promise<void> {
  return new Promise((resolve, reject) => {
    const mocha = new Mocha({
      color: true,
      ui: 'tdd',
    })

    const files = globSync('**/**.test.js', { cwd: __dirname })

    for (const file of files) {
      mocha.addFile(path.resolve(__dirname, file))
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
