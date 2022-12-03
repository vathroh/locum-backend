const mongoose = require("mongoose");

const ClinicGroupSchema = mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  business_name: {
    type: String,
    required: true,
  },
  type_of_company: {
    type: String,
    required: true,
  },
  business_registration_no: {
    type: String,
    required: true,
  },
  date_of_registration: {
    type: String,
    required: true,
  },
  business_address: {
    type: String,
    required: true,
  },
  postal_code: {
    type: String,
    required: true,
  },
  mailing_details: {
    business_name: {
      type: String,
    },
    delivery_address: {
      type: String,
    },
    postal_code: {
      type: String,
    },
  },
  documents: {
    moh_licence: {
      file_name: {
        type: String,
      },
      valid_from: {
        type: Number,
      },
      valid_to: {
        type: Number,
      },
    },
    business_acra: {
      file_name: String,
    },
  },
  user_id: [{ type: String }],
});

module.exports = mongoose.model("ClinicGroup", ClinicGroupSchema);
