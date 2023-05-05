const { v4: uuid } = require('uuid')
const path = require('path')
const rootDir = path.join(__dirname, '..')
const pythonDir = path.join(rootDir, 'files', 'python')
const { promisify } = require('util')
const fs = require('fs')
const { spawn } = require('child_process')
const writeFile = promisify(fs.writeFile)
const removeFile = promisify(fs.unlink)

const tryData = {}

module.exports = {
    executeCode: async ({ code, input, lang }) => {
        try {
            //create file for execution
            switch (lang) {
                case 'python':
                    tryData.filePath = path.join(pythonDir, `${uuid()}.py`)
                    break;
            
                default:
                    throw new Error('language not supported')
            }

            await writeFile(tryData.filePath, code)

            //exceute code
            let childProcess = null

            switch (lang) {
                case 'python':
                    childProcess = spawn('python', [tryData.filePath])
                    break;
            
                default:
                    throw new Error('language not supported')
            }

            childProcess.stdin.write(input)
            childProcess.stdin.end()

            const res = await new Promise((resolve, reject) => {
                let output = ''
                let error = ''

                childProcess.stdout.on('data', (data) => {
                    console.log(data.toString())
                    output += data;
                })

                childProcess.stderr.on('data', (data) => {
                    console.log(data.toString())
                    error += data;
                })

                childProcess.on('exit', (code) => {
                    if (code === 0) {
                        resolve(output)
                    } else {
                        console.log('process exit without code 0')
                        reject(error || 'Unknown error')
                    }
                })
            })

            console.log("response: ", res)

            return res
        } catch (error) {
            console.log("error in python: ", error.message)
            throw error
        } finally {
            //remove directory
            if (tryData.filePath.startsWith(rootDir))
                await removeFile(tryData.filePath)
        }
    }
}
