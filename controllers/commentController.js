const Clinic = require('../models/Clinic')
const { DateTime } = require('luxon')

const getCommentsByClinic = async (req, res) => {

    await Clinic.find({ _id: req.params.clinicId })
        .select('comments')
        .populate({
            path: 'comments',
            populate: {
                path: 'userId',
                model: 'User',
                select: 'full_name role profile_pict'
            }
        })
        .lean()
        .exec((err, data) => {
            er = data.map((e) => e.comments)[0]
            er.map((el) => {
                el.datetime = DateTime.fromMillis(el.datetime).toRelative()
            })

            res.json(er)
        })

}


const saveComment = async (req, res) => {
    let data = req.body
    data.datetime = DateTime.now().toMillis()
    let comment = Clinic.findById(req.params.clinicId)
    if (!jobId) return res.status(404).json({ message: "The job is not found." });
    comment.comments.push(data)

    try {
        await Clinic.updateOne({ _id: req.params.clinicId }, { $set: comment })
        res.status(200).json({ message: "You have successfully submit a comment." })
    } catch (error) {
        res.status(500).json({ message: error })
    }
}

module.exports = { getCommentsByClinic, saveComment }