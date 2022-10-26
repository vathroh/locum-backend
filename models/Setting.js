const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const SettingSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        exists: true,
        uniqeu: true,
    },
    sync_google_calendar: {
        type: Boolean,
        default: false,
    },
});

SettingSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Setting", SettingSchema);
