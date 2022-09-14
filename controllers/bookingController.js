const Job = require("../models/Job.js");
const moment = require('moment')
const { DateTime } = require('luxon')

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
    console.log(jobId)

    let assignmentAmount = jobId.assigned_to?.length


    if (assignmentAmount < 1) {
        let hasAssignment = jobId.assigned_to.includes(req.body.user_id)

        if (!hasAssignment) {
            let updatedData = jobId

            updatedData.assigned_to.push(req.body.user_id)

            try {
                const assignment = await Job.updateOne({ _id: req.params.id }, { $set: updatedData });
                res.json(assignment)
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
    const today = moment().startOf('day')
    try {
        const jobs = await Job.find({
            booked_by: { $in: [req.params.userId] },
            date: { $gte: today.toDate() }
        })
        res.status(200).json(jobs)

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const upcomingAssignmentsByUserId = async (req, res) => {
    const today = moment().startOf('day')
    try {
        const jobs = await Job.find({
            assigned_to: { $in: [req.params.userId] },
            date: { $gte: today.toDate() }
        })
        res.status(200).json(jobs)

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const completedJobsByUser = async (req, res) => {
    try {
        const jobs = await Job.find({
            assigned_to: { $in: [req.params.userId] },
            completed: true
        })
        res.status(200).json(jobs)

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const upcomingBookingByClinic = async (req, res) => {
    try {
        const jobs = await Job.find({
            assigned_to: { $in: [req.params.userId] },
            completed: true
        })
        res.status(200).json(jobs)

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const upcomingBookingsBymonth = async (req, res) => {

}

const completedBookingsByMonth = async (req, res) => {

}

module.exports = {
    createBooking,
    deleteBooking,
    upcomingBookingsByUserId,
    upcomingAssignmentsByUserId,
    upcomingBookingByClinic,
    completedJobsByUser,
    AssignTo
}