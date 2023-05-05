const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        minLength: 5,
    },
    status: {
        type: String,
        enum: ['success', 'pending', 'failed']
    },
    lang: {
        type: String,
        required: true,
        enum: ['java', 'cpp', 'python']
    },
    output: {
        stdout: {
            type: String,
        },
        stderr: {
            type: String,
        }
    },
    error: {
        stack: {
            type: String,
        },
        message: {
            type: String,
        }
    },
    input: {
        type: String
    }
}, {
    timestamps: true,
})


module.exports = mongoose.model('Job', schema)