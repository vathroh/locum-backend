const mongoose = require("mongoose");
const exists = require("mongoose-exists");

const blacklistSchema = mongoose.Schema({
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

blacklistSchema.plugin(exists);

module.exports = mongoose.model("Blacklist", blacklistSchema);
