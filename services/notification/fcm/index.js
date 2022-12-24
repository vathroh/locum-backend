const { default: axios } = require("axios");

const sendFCM = (notification) => {
  axios("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      Authorization: "key=" + process.env.FCM_KEY,
      "Content-Type": "application/json",
    },
    data: JSON.stringify(notification),
  })
    .then((data) => {
      return { status: 200, message: data };
      //   console.log(JSON.stringify(notification));
    })
    .catch((error) => {
      return { status: 500, message: "The notifications didn't sent!" };
      //   console.log("failed to send notification");
    });
};

module.exports = sendFCM;
