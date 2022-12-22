const MustChoosePreference = require("../../models/MustChoosePreference");

const getPair = async (data) => {
  try {
    const mustChoose = await MustChoosePreference.findOne({
      items: { $in: [data] },
    });

    if (mustChoose) {
      const preference = mustChoose.items;
      const pair = preference.filter((item) => item !== data);
      return pair;
    } else {
      return null;
    }
  } catch (error) {
    return { status: 500, message: error.message };
  }
};

module.exports = { getPair };
