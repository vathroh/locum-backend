const router = require("express").Router();
const Message = require("../models/Message");
const { sendMessage } = require("../services/sendingChat");

router.post("/", async (req, res) => {
  try {
    const message = await sendMessage(req.body);
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversation_id: req.params.conversationId,
    });

    const data = [];
    messages.map((message) => {
      const msg = {};
      msg._id = message._id ?? "";
      msg.type = message.type ?? "";
      msg.conversation_id = message.conversation_id ?? "";
      msg.sender = message.sender ?? "";
      msg.card = message.card ?? {};
      msg.text = message.text ?? "";
      msg.createdAt = message.createdAt ?? "";
      msg.updatedAt = message.updatedAt ?? "";

      data.push(msg);
    });

    res.status(200).json(data);
  } catch (error) {
    res.json(500).json({ message: error });
  }
});

module.exports = router;
