const { sendMessage } = require("../../sendingChat");

const saveMessage = async (data) => {
  //   console.log(data);
  delete data._id;

  console.log(data);
  const savedMessage = await sendMessage(data);
  return savedMessage;
};

module.exports = { saveMessage };
