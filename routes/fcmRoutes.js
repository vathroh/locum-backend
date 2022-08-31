const express = require("express");
const router = express.Router();
const fetch = require('axios')

router.post('/', (req, res) => {
    let notification = {
        'title': "this is title",
        'text': "subtitle"
    }

    let fcm_tokens = ['dQVJW9BRFCkunsaNRKsg1x:APA91bGrPKU6j8UTiTsPz3rWKf-UXVIrAMc8HeDyE_MZyspQcLFnH_DMYBgV2dKFJpntJzw_lyCAAbECB1Va5e7ncDCNzofTP6KTGW9mIZj8IfxInzzFue34bc2OnIIopN4gtWDYFdRg']

    let notification_body = {
        'notification': notification,
        'registration_ids': fcm_tokens
    }

    fetch('https://fcm.googleapis.com/v1/projects/myproject-b5ae1/messages:send', {
        'method': 'POST',
        'headers': {
            'Authorization': 'Bearer=' + 'AAAAnCpEolc:APA91bGlb-qUXFptQrRHc4p0PdBGaNUDrsDA2x-DgwzDOO2fuWmeOKrEl7GK21H69J8xJaGgxiBfehd8F-K2_yDnmkC8QzAKpOxLM8B7FKtjgImYsn_21luWpmQmHAZIQX2rG1Brd-M8',
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