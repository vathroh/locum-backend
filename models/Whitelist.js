const mongoose = require("mongoose");
const exists = require("mongoose-exists");

const whitelistSchema = mongoose.Schema({
    clinic_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clinic",
        exists: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        exists: true,
    },
    added_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        exists: true,
    },
});

whitelistSchema.plugin(exists);

module.exports = mongoose.model("Whitelist", whitelistSchema);
