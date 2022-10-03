const router = require('express').Router()
const { getCommentsByClinic } = require('../controllers/commentController')

router.get('/:clinicId', getCommentsByClinic)

module.exports = router