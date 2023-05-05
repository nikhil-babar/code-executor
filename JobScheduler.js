const BullQueue = require('bull')
const Queue = new BullQueue('code-executor', {
    redis: {
        host: 'localhost',
        port: 6379
    }
})
const { executeCode: execCompiledLanguage } = require('./services/compileLang')
const { executeCode: execInterpretatedLanguage } = require('./services/interpretedLang')
const JobDB = require('./models/Job')

Queue.process('compiled_language', (Job) => execCompiledLanguage(Job.data))
Queue.process('interpreted_language', (Job) => execInterpretatedLanguage(Job.data))

Queue.on('completed', async (Job) => {
    try {
        console.log("Completion in queue")

        await JobDB.findByIdAndUpdate(Job.data._id, {
            output: Job.returnvalue,
            status: 'success'
        })

    } catch (error) {
        console.log(error.message)
    }
})

Queue.on('failed', async (Job) => {
    try {
        console.log("Error in queue", Job.stacktrace)

        await JobDB.findByIdAndUpdate(Job.data._id, {
            error: {
                stack: Job.data,
                message: Job.name
            },
            status: 'failed'
        })

    } catch (error) {
        console.log(error.message)
    }
})

Queue.on('error', (err) => console.log(err.message))

module.exports = Queue