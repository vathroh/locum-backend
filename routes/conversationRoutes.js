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
            .then(async (data) => {
                let userIds = []
                data.map((e) => {
                    e.members.map((l) => {
                        if (l !== req.params.userId) {

                            userIds.push({
                                _id: e._id,
                                user_id: l
                            })
                        }
                    })
                })

                const conv = userIds.map(async (d) => {
                    const user = await User.findById(d.user_id).select({ full_name: 1, _id: 0, profile_pict: 1 });
                    return {
                        _id: d._id,
                        user: user
                    }
                })

                promisedConv = await Promise.all(conv)
                res.json(promisedConv)
            })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})


module.exports = router