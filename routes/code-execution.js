const router = require('express').Router()
const Job = require('../models/Job')
const mongoose = require('mongoose')
const Queue = require('../JobScheduler')
require('dotenv').config()

router.post('/', async (req, res) => {
    try {
        const { lang, code } = req.body

        const job = new Job({
            lang,
            code,
            status: 'pending',
        })
        await job.save()

        res.status(201).json(job)

        Queue.add(lang, job)

    } catch (error) {
        console.log(error.message)

        if (error instanceof mongoose.Error) {
            res.sendStatus(422)
        } else {
            res.sendStatus(500)
        }
    }
})

router.get('/', async (req, res) => {
    try {
        const { id } = req.query

        if (!id) return res.sendStatus(422)

        const job = await Job.findById(id)

        console.log(job)

        if (!job || job.status === 'pending') {
            return res.sendStatus(400)
        }

        res.status(200).json(job)

        job.delete()

    } catch (error) {
        res.sendStatus(500)
    }
})

module.exports = router