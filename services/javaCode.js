const { v4: uuid } = require('uuid')
const path = require('path')
const rootDir = path.join(__dirname, '..')
const javaDir = path.join(rootDir, 'files', 'java')
const { promisify } = require('util')
const fs = require('fs')
const mkdir = promisify(fs.mkdir)
const writeFile = promisify(fs.writeFile)
const execute = promisify(require('child_process').execFile)
const deleteDirectory = require('../utils/deleteDir')

const tryData = {}

module.exports = {
    executeCode: async ({ code }) => {
        try {
            console.log("execution started..")
            //create file for execution
            tryData.dirPath = path.join(javaDir, `${uuid()}`)
            tryData.filePath = path.join(tryData.dirPath, 'Main.java')

            await mkdir(tryData.dirPath)
            await writeFile(tryData.filePath, code)

            //exceute code
            await execute('javac', [tryData.filePath])
            tryData.output = await execute('java', ['-classpath', tryData.dirPath, 'Main'])

            return tryData.output

        } catch (error) {
            console.log("Error in java code")
            return Promise.reject(error)

        } finally {
            if (tryData.dirPath.startsWith(rootDir)) {
                console.log("removing directory")
                deleteDirectory(tryData.dirPath)
            }
        }
    }
}


