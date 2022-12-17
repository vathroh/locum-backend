const { sendMessage } = require("../../sendingChat");

const saveMessage = async (data) => {
  //   console.log(data);

  const savedMessage = await sendMessage(data);
  console.log(savedMessage);
  return savedMessage;
};

module.exports = { saveMessage };
