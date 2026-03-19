const mongoose = require("mongoose");

const mobileVerificationSchema = new mongoose.Schema({
    mobileNumber: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model("MobileVerification", mobileVerificationSchema);
