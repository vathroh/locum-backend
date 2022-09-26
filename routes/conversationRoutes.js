const router = require('express').Router()
const Conversation = require('../models/Conversation')

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
                $in: [req.body.userId]
            }
        })

        res.status(200).json(conversation)
    } catch (error) {
        res.status(500).json({ message: error })
    }
})

module.exports = router