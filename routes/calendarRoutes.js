const router = require('express').Router()

const {
    saveEventByAPI,
    getEventByUserId,
    get3DaysEventByUserId
} = require('../controllers/calendarController')

router.get('/3day/:userId', get3DaysEventByUserId)
router.get('/:userId', getEventByUserId)
router.post('/', saveEventByAPI)


module.exports = router