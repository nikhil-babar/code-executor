const BullQueue = require('bull')
const Queue = new BullQueue('code-executor', {
    redis: {
        host: 'redis',
        port: 6379
    }
})
const { executeCode: executeJava } = require('./services/javaCode')
const { executeCode: executePython } = require('./services/pythonCode')
const JobDB = require('./models/Job')

Queue.process('java', (Job) => executeJava(Job.data))
Queue.process('python', (Job) => executePython(Job.data))

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
        console.log("Error in queue")

        await JobDB.findByIdAndUpdate(Job.data._id, {
            error: {
                stack: Job.stacktrace.toString(),
                message: Job.name
            },
            status: 'failed'
        })

    } catch (error) {
        console.log(error.message)
    }
})

module.exports = Queue