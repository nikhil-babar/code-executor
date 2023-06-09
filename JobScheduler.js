const BullQueue = require("bull");
const Queue = new BullQueue("code-executor", {
  redis: {
    host: "localhost",
    port: 6379,
  },
});
const { executeCode: execCompiledLanguage } = require("./services/compileLang");
const {
  executeCode: execInterpretatedLanguage,
} = require("./services/interpretedLang");
const JobDB = require("./models/Job");

Queue.process("compiled_language", (Job) => execCompiledLanguage(Job.data));
Queue.process("interpreted_language", (Job) =>
  execInterpretatedLanguage(Job.data)
);

Queue.on("completed", async (Job) => {
  try {
    await JobDB.findByIdAndUpdate(Job.data._id, {
      output: Job.returnvalue,
      status: "success",
    });
  } catch (error) {
    console.log(error.message);
  }
});

Queue.on("failed", async (Job) => {
  try {
    const messageIndex = Job.failedReason?.indexOf("error:");
    const errorMessage = Job.failedReason
      ?.substring(messageIndex)
      ?.split(":")[1];
    console.log(errorMessage);

    await JobDB.findByIdAndUpdate(Job.data._id, {
      error: errorMessage,
      status: "failed",
    });

    Job.stacktrace.forEach((err, i) => console.log(i + ": " + err));
  } catch (error) {
    console.log(error.message);
  }
});

Queue.on("error", (err) => console.log("Error in queue: " + err.message));

module.exports = Queue;
