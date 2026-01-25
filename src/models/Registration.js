// Registration model
const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  registrationId: {
    type: String,
    unique: true,
    required: true
  },
  firstName: String,
  middleName: String,
  lastName: String,

  gender: String,
  dob: String,
  age: String,

  maritalStatus: String,
  mobile: String,
  alternateMobile: String,

  email: String,
  aadhaar: String,
  subCaste: String,

  fatherName: String,
  fatherOccupation: String,
  motherName: String,
  motherOccupation: String,

  houseNo: String,
  street: String,
  city: String,

  mandal: String,
  taluka: String,
  village: String,
  villageGroup: String,

  qualification: String,
  course: String,
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING"
  }
}, { timestamps: true });

module.exports = mongoose.model("Registration", registrationSchema);
