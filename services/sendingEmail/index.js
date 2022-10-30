const nodemailer = require("nodemailer");
const env = require("dotenv");
const logger = require("../logger/emailLogger");
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
            if (err)
                logger.emailLogger.log(
                    "error",
                    `${err}, Data: { to: ${email}, subject: ${subject}, body: ${text}, ${html} }`
                );
            console.log("The email has been sent.");
            logger.emailLogger.log(
                "info",
                `successfully sent email. Data: { to: ${email}, subject: ${subject}, body: ${text}, ${html} }`
            );
        });
    };

    sendEmail(email, subject, text, html);
};

module.exports = { sendingEmail };
