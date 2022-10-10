const router = require('express').Router()
const Conversation = require('../models/Conversation')
const User = require('../models/User')

router.post('/', async (req, res) => {
    const conversation = new Conversation({
        members: [req.body.sender_id, req.body.receiver_id]
    })

    try {
        res.status(201).json(await conversation.save())
    } catch (error) {
        res.status(500).json({ message: "error" })
    }
})

router.get('/:userId', async (req, res) => {
    try {
        const conversation = await Conversation.find({
            members: {
                $in: [req.params.userId]
            }
        }).lean()

        const ea = conversation.map(async (item) => {
            await item.members.map(async (e) => {
                if (e != req.params.userId) {
                    item.sender = await User.findById(e)

                }
            })
            return item
        })

        res.status(200).json(await promise.all(ea))
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router