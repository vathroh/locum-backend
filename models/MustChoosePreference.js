const mongoose = require("mongoose");

const MustChooseSchema = mongoose.Schema({
  items: {
    type: Array,
  },
});

module.exports = mongoose.model("MustChoose", MustChooseSchema);
