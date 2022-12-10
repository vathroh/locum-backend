const router = require("express").Router();
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const { createConversation } = require("../services/sendingChat");

router.post("/", async (req, res) => {
  try {
    const sender = await User.findById(req.body.sender_id);
    if (!sender) return res.status(404).json({ message: "Sender not found" });

    const receiver = await User.findById(req.body.receiver_id);
    if (!receiver)
      return res.status(404).json({ message: "Receiver not found" });

    const conv = await createConversation(
      req.body.sender_id,
      req.body.receiver_id
    );
    res.json(conv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/to", async (req, res) => {
  try {
    const toUser = await User.findById(req.query.userId);
    if (!toUser) return res.status(404).json({ message: "User not found" });

    if (req.query.userId) {
      const conv = await createConversation(req.query.userId, req.user._id);

      const user = await User.findById(req.query.userId)
        .select({
          role_id: 1,
          role: 1,
          full_name: 1,
          profile_pict: 1,
        })
        .lean();

      if (!user) return res.status(404).json({ message: "User not found." });

      user.conversation_id = conv._id;
      if (!user.profile_pict) {
        user.profile_pict = "";
      } else {
        user.profile_pict = process.env.BASE_URL + user.profile_pict;
      }

      res.json(user);
    } else {
      return res.status(404).json({ message: "Please query the user" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/users/:userId", async (req, res) => {
  try {
    const user = [];
    const conversation = await Conversation.find({
      members: {
        $in: [req.params.userId],
      },
    })
      .lean()
      .then(async (data) => {
        data.map((item) => {
          item.members.map((e) => {
            if (e !== req.params.userId) {
              const data = { _id: item._id, user_id: e };
              user.push(data);
            }
          });
        });
      });

    const users = new Array();

    const getUsers = user.map(async (item) => {
      const user = await User.findById(item.user_id)
        .select({
          role_id: 1,
          role: 1,
          full_name: 1,
          profile_pict: 1,
        })
        .lean();

      user.conversation_id = item._id;
      user.last_message = "";
      user.time_message = "";

      if (!user.profile_pict) {
        user.profile_pict = "";
      } else {
        user.profile_pict = process.env.BASE_URL + user.profile_pict;
      }
      users.push(user);
    });

    await Promise.all(getUsers);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: {
        $in: [req.params.userId],
      },
    })
      .lean()
      .then(async (data) => {
        let userIds = [];
        data.map((e) => {
          e.members.map((l) => {
            if (l !== req.params.userId) {
              userIds.push({
                _id: e._id,
                user_id: l,
              });
            }
          });
        });

        const conv = userIds.map(async (d) => {
          const user = await User.findById(d.user_id)
            .select({
              full_name: 1,
              _id: 1,
              profile_pict: 1,
            })
            .lean();

          user.last_message = d.last_message ?? "";
          user.time_message = d.time_message ?? "";

          return {
            _id: d._id,
            user: user,
          };
        });

        promisedConv = await Promise.all(conv);
        res.json(promisedConv);
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
