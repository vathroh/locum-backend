const mongoose = require("mongoose");
const exists = require("mongoose-exists");

const AchievementSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        refer: "User",
        exists: true,
    },
    item: {
        type: String,
        required: true,
    },
    file: {
        type: String,
        required: true,
    },
});

AchievementSchema.plugin(exists);

module.exports = mongoose.model("Achievement", AchievementSchema);
