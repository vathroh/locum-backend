const Job = require("../models/Job.js");
const moment = require('moment')
const { DateTime } = require('luxon')


const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate('clinic')
            .then((data) => { res.json(data) })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

const getUpcomingJobs = async (req, res) => {
    const today = moment().startOf('day')

    try {
        const jobs = await Job.find(
            {
                date: {
                    $gte: today.toDate()
                }
            }
        )
            .sort({ date: 'asc' })
            .populate('clinic').
            then((data) => { res.json(data) })
    } catch (error) {
        res.status(404).json({ message: error.message });
    }

}

const getPastJobs = async (req, res) => {
    const today = moment().startOf('day')

    try {
        const jobs = await Job.find(
            {
                date: {
                    $lte: today.toDate()
                }
            }
        )
            .populate('clinic').
            then((data) => { res.json(data) })
    } catch (error) {
        res.status(404).json({ message: error.message });
    }

}

const getJobById = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);
        res.json(job);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }

}

const getJobByClinicId = async (req, res) => {
    console.log(req.params.id)
    try {
        let job = await Job.find({ "clinic": req.params.id });
        res.json(job);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }

}

const saveJob = async (req, res) => {

    const job = new Job(req.body);
    try {
        const savedJob = await job.save();
        res.status(201).json(savedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updateJob = async (req, res) => {
    const jobId = await Job.findById(req.params.id);
    if (!jobId) return res.status(404).json({ message: "The job is not found." });
    try {
        const updatedJob = await Job.updateOne({ _id: req.params.id }, { $set: req.body });
        res.status(200).json(updatedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


const deleteJob = async (req, res) => {
    const jobId = await Job.findById(req.params.id);
    if (!jobId) return res.status(404).json({ message: "The job is not found." });
    try {
        const deletedJob = await Job.updateOne({ _id: req.params.id }, { $set: req.body });
        res.status(200).json(deletedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


//Booking 

const createBooking = async (req, res) => {


    const jobId = await Job.findById(req.params.id);

    if (!jobId) return res.status(404).json({ message: "The job is not found." });

    let hasUserBooked = jobId.booked_by.includes(req.body.user_id)

    if (!hasUserBooked) {
        let updatedData = jobId

        updatedData.booked_by.push(req.body.user_id)

        try {
            const bookedJob = await Job.updateOne({ _id: req.params.id }, { $set: updatedData });
            res.json(bookedJob)
        } catch (error) {
            res.status(400).json({ message: error.message });
        }

    } else {
        res.json("You have already booked this job.")
    }
}

const deleteBooking = async (req, res) => {

    const jobId = await Job.findById(req.params.id);

    if (!jobId) return res.status(404).json({ message: "The job is not found." });

    let hasUserBooked = jobId.booked_by.includes(req.body.user_id)

    if (hasUserBooked) {
        let updatedData = jobId

        updatedData.booked_by.pop(req.body.user_id)

        try {
            const bookedJob = await Job.updateOne({ _id: req.params.id }, { $set: updatedData });
            res.json(bookedJob)
        } catch (error) {
            res.status(400).json({ message: error.message });
        }

    } else {
        res.json("You have already canceled booking this job.")
    }
}

const AssignTo = async (req, res) => {

    const jobId = await Job.findById(req.params.id);
    if (!jobId) return res.status(404).json({ message: "The job is not found." });

    let assignmentAmount = jobId.assigned_to.length

    if (assignmentAmount >= 1) {
        let hasAssignment = jobId.assigned_to.includes(req.body.user_id)

        if (!hasAssignment) {
            let updatedData = jobId

            updatedData.applied_by.push(req.body.user_id)

            try {
                const bookedJob = await Job.updateOne({ _id: req.params.id }, { $set: updatedData });
                res.json(bookedJob)
            } catch (error) {
                res.status(400).json({ message: error.message });
            }

        } else {
            res.status(400).json("You have booked this job.")
        }

    } else {
        res.status(400).json("The job has been assigned.")

    }
}

const upcomingBookingsByUserId = async (req, res) => {
    try {
        const jobs = await Job.find({
            booked_by: { $in: [req.params.userId] }
        })
        res.status(200).json(jobs)

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const upcomingAssignmentsByUserId = async (req, res) => {
    try {
        const jobs = await Job.find({
            assigned_to: { $in: [req.params.userId] }
        })
        res.status(200).json(jobs)

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const upcomingBookingsBymonth = async (req, res) => {

}

const completedBookings = async (req, res) => {

}

const completedBookingsByMonth = async (req, res) => {

}





//Searching Jobs
const filteredJob = async (req, res) => {

    let filters = {
        gender: req.query.prefered_gender,
        location: req.query.location,
        work_time_start: req.query.timefrom,
        work_time_finish: req.query.timeto,
        price: { $gte: req.query.pricefrom, $lte: req.query.priceto },
        date: { $gte: req.query.datefrom, $lte: req.query.dateto }
    }

    await Job.find({ ...filters })
        .populate('clinic')
        .then((jobs) => {
            const a = jobs.filter((e) => e.clinic.location == req.query.location)
            res.json(a)
        })
        .catch((error) => {
            res.status(500).json({ message: error.message })
        })
}

module.exports = {
    getAllJobs,
    getUpcomingJobs,
    getPastJobs,
    getJobById,
    getJobByClinicId,
    saveJob,
    updateJob,
    deleteJob,
    createBooking,
    deleteBooking,
    filteredJob
}