const nodemailer = require("nodemailer");
const env = require("dotenv");
env.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

const sendingEmail = (email, subject, text, html) => {
    const sendEmail = (email, subject, text, html) => {
        const options = {
            from: "'WORKWIZ' <noreplay@locum.com>",
            to: email,
            subject: subject,
            text: text,
            html: html,
        };

        transporter.sendMail(options, (err, info) => {
            if (err) res.json(err);
            res.json("The email has been sent.");
        });
    };

    sendEmail(email, subject, text, html);
};

module.exports = { sendingEmail };
