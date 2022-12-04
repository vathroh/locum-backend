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

    res.status(200).json(messages);
  } catch (error) {
    res.json(500).json({ message: error });
  }
});

module.exports = router;
