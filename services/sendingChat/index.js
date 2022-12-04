const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");
const { chatLogger } = require("../logger/chatLogger");
const { conversationLogger } = require("../logger/conversationLogger");

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
    conversationLogger.info(JSON.stringify(conv));
    return conv;
  } else {
    conversationLogger.info(JSON.stringify(existConversation));
    return existConversation;
  }
};

const sendMessage = async (data) => {
  const newMessage = new Message(data);
  const savedMessage = await newMessage.save();
  chatLogger.info(JSON.stringify(data));
  return savedMessage;
};

module.exports = {
  createConversation,
  sendMessage,
};
