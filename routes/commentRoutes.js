const router = require('express').Router()
const { getCommentsByClinic } = require('../controllers/commentController')

router.put('/get/:clinicId', getCommentsByClinic)

module.exports = router