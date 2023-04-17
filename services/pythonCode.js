const { v4: uuid } = require('uuid')
const path = require('path')
const rootDir = path.join(__dirname, '..')
const pythonDir = path.join(rootDir, 'files', 'python')
const { promisify } = require('util')
const fs = require('fs')
const writeFile = promisify(fs.writeFile)
const removeFile = promisify(fs.unlink)
const execute = promisify(require('child_process').execFile)

const tryData = {}

module.exports = {
    executeCode: async ({ code }) => {
        try {
            //create file for execution
            tryData.filePath = path.join(pythonDir, `${uuid()}.py`)
            await writeFile(tryData.filePath, code)

            //exceute code
            tryData.output = await execute('python3', [tryData.filePath])

            return tryData.output
        } catch (error) {
            console.log(error.message)
            throw error
        } finally {
            //remove directory
            if (tryData.filePath.startsWith(rootDir))
                await removeFile(tryData.filePath)
        }
    }
}
