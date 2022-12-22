const mongoose = require("mongoose");
const exists = require("mongoose-exists");

const VaccinationSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        exists: true,
    },
    item: {
        type: String,
    },
    file: {
        type: String,
    },
});

VaccinationSchema.plugin(exists);

module.exports = mongoose.model("Vaccination", VaccinationSchema);
