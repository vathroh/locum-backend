const router = require("express").Router();
const Conversation = require("../models/Conversation");
const User = require("../models/User");

router.post("/", async (req, res) => {
  try {
    const existConversation = await Conversation.findOne({
      $and: [
        {
          members: {
            $in: [req.body.sender_id],
          },
        },
        {
          members: {
            $in: [req.body.receiver_id],
          },
        },
      ],
    });

    if (!existConversation) {
      const conversation = new Conversation({
        members: [req.body.sender_id, req.body.receiver_id],
      });

      try {
        res.status(201).json(await conversation.save());
      } catch (error) {
        res.status(500).json({ message: "error" });
      }
    } else {
      res.json(existConversation);
    }
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
          const user = await User.findById(d.user_id).select({
            full_name: 1,
            _id: 1,
            profile_pict: 1,
          });
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

module.exports = router;
