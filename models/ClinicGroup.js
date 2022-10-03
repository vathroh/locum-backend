const mongoose = require('mongoose')

const ClinicGroupSchema = mongoose.Schema({
    corp_name: {
        type: String
    }
})

module.exports = mongoose.model("ClinicGroup", ClinicGroupSchema)