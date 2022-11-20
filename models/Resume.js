const mongoose = require("mongoose");
const exists = require("mongoose-exists");

const ResumeSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        exists: true,
        required: true,
    },
    file: {
        type: String,
        required: true,
    },
});

ResumeSchema.plugin(exists);

module.exports = mongoose.model("Resume", ResumeSchema);
