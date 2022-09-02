const express = require("express");
const router = express.Router();
const amqp = require("amqplib/callback_api")


router.get('/', (req, res) => {

    const msg = amqp.connect(`amqp://localhost`, (err, connection) => {
        if (err) {
            throw err
        }
        connection.createChannel((err, channel) => {
            if (err) {
                throw err;
            }

            let queName = "test_quee"
            let message = "This is que test by rabbitMQ."

            channel.assertQueue(queName, {
                durable: false
            })

            channel.consume(queName, (message) => {
                console.log(`Receive : ${message.content.toString()}`);
                channel.ack(message)

            })
        })
    })
    res.json(msg)
})

module.exports = router;