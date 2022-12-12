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
  const totalRows = await Message.find({
    conversation_id: req.params.conversationId,
  }).count();

  const limit = parseInt(req.query.limit) || 100;
  const totalPage = Math.ceil(totalRows / limit);
  const page = parseInt(req.query.page) - 1 || totalPage - 1;
  const offset = limit * page;

  const messages = await Message.find({
    conversation_id: req.params.conversationId,
  })
    .skip(offset)
    .limit(limit)
    .lean();

  const data = [];

  messages.map((message) => {
    const msg = {};
    msg.body = {};
    msg.service = "chat";
    msg.to = "";
    msg.body = {
      _id: message._id ?? "",
      type: message.type ?? "",
      conversation_id: message.conversation_id ?? "",
      sender: message.sender ?? "",
      card: message.card ?? {},
      text: message.text ?? "",
      is_deleted: message.is_deleted ?? false,
      is_read: message.is_read ?? false,
      date_time: "",
    };
    msg.page = page + 1;
    msg.limit = limit;
    msg.totalRows = totalRows;
    msg.totalPages = totalPage;

    data.push(msg);
  });

  res.json(data);
});

module.exports = router;
