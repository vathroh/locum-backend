const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");

const createConversation = async (sender, receiver) => {
  const existConversation = await Conversation.findOne({
    $and: [
      {
        members: {
          $in: [sender],
        },
      },
      {
        members: {
          $in: [receiver],
        },
      },
    ],
  });

  if (!existConversation) {
    const conversation = new Conversation({
      members: [sender, receiver],
    });

    const conv = await conversation.save();
    return conv;
  } else {
    return existConversation;
  }
};

const sendMessage = async (data) => {
  const newMessage = new Message(data);
  const savedMessage = await newMessage.save();
  return savedMessage;
};

module.exports = {
  createConversation,
  sendMessage,
};
