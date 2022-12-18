const { sendMessage } = require("../../sendingChat");

const saveMessage = async (data) => {
  delete data._id;

  const savedMessage = await sendMessage(data);
  return savedMessage;
};

module.exports = { saveMessage };
