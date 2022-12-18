const OnlineUser = require("../../models/Onlineuser");

const saveUser = async (data) => {
  const inputUser = new OnlineUser(data);
  const isExists = await OnlineUser.findOne({
    user: data.user,
    socket: data.socket,
  });

  if (!isExists) {
    const newUser = await inputUser.save();
  }
};

const deleteUser = async (data) => {
  const user = await OnlineUser.findOne(data);
  if (user) await OnlineUser.deleteMany(user);
};

module.exports = { saveUser, deleteUser };
