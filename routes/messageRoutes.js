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
    const totalRows = await Message.find({
      conversation_id: req.params.conversationId,
    }).count();

    const limit = parseInt(req.query.limit) || 100;
    const totalPage = Math.ceil(totalRows / limit);
    const page = parseInt(req.query.page) || totalPage;

    let minus = totalRows % limit;

    if (totalRows < limit) {
      minus = 0;
    }

    const offset = limit * (page - 1) - minus;
    console.log(req.query.page);

    return res.json({
      page: page,
      offset: offset,
      limit: limit,
      totalPage: totalPage,
      totalRows: totalRows,
    });

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

      data.push(msg);
    });

    res.json({
      page: page + 1,
      limit: limit,
      totalRows: totalRows,
      totalPage: totalPage,
      data: data,
    });
  } catch (error) {
    res.json(500).json({ message: error });
  }
});

router.get("/mobile/:conversationId", async (req, res) => {
  try {
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
      msg.page = page + 1;
      msg.service = "chat";
      msg.to = "";
      msg._id = message._id ?? "";
      msg.type = message.type ?? "";
      msg.conversation_id = message.conversation_id ?? "";
      msg.sender = message.sender ?? "";
      msg.card = message.card ?? {};
      msg.text = message.text ?? "";
      msg.is_deleted = message.is_deleted ?? false;
      msg.is_read = message.is_read ?? false;
      msg.date_time = "";

      data.push(msg);
    });

    res.json(data);
  } catch (error) {
    res.json(500).json({ message: error });
  }
});

module.exports = router;
