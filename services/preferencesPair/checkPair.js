const { getPair } = require(".");

const checkPair = async (preferences) => {
  const isExists = [];

  if (preferences.length > 0) {
    const checking = preferences?.map(async (data) => {
      const pair = await getPair(data);

      if (pair) {
        pair.map((item) => {
          if (preferences.includes(item)) isExists.push(item);
        });
      }
    });
  }

  if (checking) await Promise.all(checking);

  if (isExists.length > 0) {
    return { status: 400, message: "Please check preference items." };
  }
};

module.exports = { checkPair };
