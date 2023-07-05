const { v4: uuid } = require("uuid");
const path = require("path");
const { promisify } = require("util");
const fs = require("fs");
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const execute = promisify(require("child_process").execFile);
const deleteDirectory = require("../utils/deleteDir");
const { spawn } = require("child_process");

const rootDir = path.join(__dirname, "..");
const javaDir = path.join(rootDir, "files", "java");

const tryData = {};

module.exports = {
  executeCode: async ({ code, input, lang }) => {
    try {
      switch (lang) {
        case "java":
          tryData.dirPath = path.join(javaDir, `${uuid()}`);
          tryData.filePath = path.join(tryData.dirPath, "Main.java");
          break;

        default:
          break;
      }

      await mkdir(tryData.dirPath);
      await writeFile(tryData.filePath, code);

      //compile code
      let childProcess = null;

      switch (lang) {
        case "java":
          await execute("javac", [tryData.filePath]);
          childProcess = spawn("java", ["-classpath", tryData.dirPath, "Main"]);
          break;

        default:
          throw new Error("language not supported");
      }

      childProcess.stdin.write(input);
      childProcess.stdin.end();

      const res = await new Promise((resolve, reject) => {
        let output = "";
        let error = "";

        childProcess.stdout.on("data", (data) => {
          output += data;
        });

        childProcess.stderr.on("data", (data) => {
          error += data;
        });

        childProcess.on("exit", (code) => {
          if (code === 0) {
            resolve(output);
          } else {
            reject(error || "Unknown error");
          }
        });
      });

      return res;
    } catch (error) {
      return Promise.reject(error);
    } finally {
      if (tryData.dirPath.startsWith(rootDir)) {
        console.log("removing directory");
        deleteDirectory(tryData.dirPath);
      }
    }
  },
};
