const OnlineUser = require("../../../models/Onlineuser");
const { saveUser } = require("../../../utils/onlineUser");

const saveUserOnline = async (data) => {
  const isExists = await OnlineUser.findOne({
    socket: data.socket,
  });

  console.log(data);

  if (isExists) {
    OnlineUser.updateOne({ socket_id: data.socket_id }, { $set: { data } });
  } else {
    return saveUser(data);
  }
};

module.exports = { saveUserOnline };
