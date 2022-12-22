const mongoose = require("mongoose");

const PreferenceSchema = mongoose.Schema({
    item: {
        type: String,
    },
});

module.exports = mongoose.model("Preference", PreferenceSchema);
