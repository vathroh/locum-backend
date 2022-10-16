const Vonage = require("@vonage/server-sdk");

const sendingSMS = (message, toNumber) => {
    const vonage = new Vonage(
        {
            apiKey: process.env.VONAGE_API_KEY,
            apiSecret: process.env.VONAGE_API_SECRET,
        },
        { debug: true }
    );

    vonage.message.sendSms(
        "LOCUM",
        toNumber,
        message,
        { type: "unicode" },
        (err, responseData) => {
            if (responseData) {
                // console.log(responseData);
                // res.json("suksess");
            }
        }
    );
};

module.exports = { sendingSMS };
