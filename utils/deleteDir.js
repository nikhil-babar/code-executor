const path = require('path')
const rootDir = path.join(__dirname, '..')
const fs = require('fs')

module.exports = function deleteDirectory(directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file) => {
            const currentPath = path.join(directoryPath, file);
            if (fs.lstatSync(currentPath).isDirectory()) {
                deleteDirectory(currentPath);
            } else {
                fs.unlinkSync(currentPath);
            }
        });

        if(directoryPath.startsWith(rootDir))
            fs.rmdirSync(directoryPath);
    }
}