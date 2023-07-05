const router = require("express").Router();
const Job = require("../models/Job");
const mongoose = require("mongoose");
const Queue = require("../JobScheduler");
require("dotenv").config();

router.post("/", async (req, res) => {
  try {
    const { lang, code, input } = req.body;

    const job = new Job({
      lang,
      code,
      input,
      status: "pending",
    });
    await job.save();

    res.status(201).json(job);

    let jobtype = "";

    switch (lang) {
      case "java":
      case "cpp":
      case "c":
        jobtype = "compiled_language";
        break;

      default:
        jobtype = "interpreted_language";
        break;
    }

    Queue.add(jobtype, job);
  } catch (error) {
    if (error instanceof mongoose.Error) {
      res.sendStatus(422);
    } else {
      res.sendStatus(500);
    }
  }
});

router.get("/", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) return res.sendStatus(422);

    const job = await Job.findById(id);

    if (!job || job.status === "pending") {
      return res.sendStatus(404);
    }

    res.status(200).json(job);

    job.delete();
  } catch (error) {
    res.sendStatus(500);
  }
});

module.exports = router;
