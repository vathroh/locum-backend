const express = require("express");
const router = express.Router();
const fetch = require('axios')

router.post('/sendToAll', (req, res) => {
    let notification = {
        'title': "this is title",
        'text': "subtitle"
    }

    let fcm_tokens = []

    let notification_body = {
        'notification': notification,
        'registration_ids': fcm_tokens
    }

    fetch('https://fcm.googleapis.com/fcm/send', {
        'method': 'POST',
        'headers': {
            'Authorization': 'key=' + '0f7d614251cc6eaff372dd6e936d627f64696238',
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify(notification_body)
    })
        .then(() => {
            res.status(200).send('Notification send successfully!')
        })
        .catch((error) => {
            res.status(400).send('Something went wrong!')
            console.log(error);
        })

});

module.exports = router;