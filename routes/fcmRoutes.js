const express = require("express");
const router = express.Router();
const nodemailer = require('nodemailer')
const axios = require('axios')
const env = require('dotenv')

env.config()

router.post('/notification', (req, res) => {
    let notification = {
        'title': req.body.title,
        'body': req.body.body
    }

    let fcm_tokens = req.body.device_ids

    let notification_body = {
        'notification': notification,
        'registration_ids': fcm_tokens
    }

    axios('https://fcm.googleapis.com/fcm/send', {
        'method': 'POST',
        'headers': {
            'Authorization': 'key=AAAAyj_T3RI:APA91bET0U9AZGqKeoAoO8PdXHHiMxkliHkA655fSHV9BA3sok-aiUErDOlA4Vqq2TnmKcCo5PQSW8gvrT3xKOUWCTCOO-cxvGcpLRSzDmF1JAB0uU_v0aED7GWE0S578R4FnCmudTkt',
            'Content-Type': 'application/json'
        },
        'data': JSON.stringify(notification_body)
    })
        .then(() => {
            res.status(200).send('Notification send successfully!')
        })
        .catch((error) => {
            res.status(400).send('Something went wrong!')
            console.log(error);
        })

});

router.post('/email', async (req, res) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    })

    const email = req.body.email
    const subject = req.body.subject
    const text = req.body.text
    const html = req.body.html

    const sendEmail = (email, subject, text, html) => {
        const options = {
            from: "'LOCUM' <noreplay@locum.com>",
            to: email,
            subject: subject,
            text: text,
            html: html
        }

        transporter.sendMail(options, (err, info) => {
            if (err) res.json(err)
            res.json('The email has been sent.')
        })
    }

    sendEmail(email, subject, text, html)
})

module.exports = router;