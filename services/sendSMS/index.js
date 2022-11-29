const Vonage = require("@vonage/server-sdk");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const sendingSMS = (message, toNumber) => {
  // const vonage = new Vonage(
  //     {
  //         apiKey: process.env.VONAGE_API_KEY,
  //         apiSecret: process.env.VONAGE_API_SECRET,
  //     },
  //     { debug: true }
  // );

  // vonage.message.sendSms(
  //     "LOCUM",
  //     toNumber,
  //     message,
  //     { type: "unicode" },
  //     (err, responseData) => {
  //         if (responseData) {
  //             // console.log(responseData);
  //             // res.json("suksess");
  //         }
  //     }
  // );

  //   client.messages
  //     .create({ body: "Hi there", from: "+15618213323", to: "+6285876360062" })
  //     .then((message) => console.log(message.sid));

  client.messages
    .create({
      body: "haloooo ",
      from: "+13608001799",
      to: "6285876360062",
    })
    .then((message) => {
      console.log(message.sid);
      res.json(message);
    });
};

module.exports = { sendingSMS };
