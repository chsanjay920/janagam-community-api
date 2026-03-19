// Registration repository
const Registration = require("../models/Registration");
const Rating = require("../models/Rating");
const DashboardData = require("../models/DashboardData");
const UsersCount = require("../models/UsersCount");
const RegistrationCounter = require("../models/RegistrationCounter");
const jwt = require("jsonwebtoken");
const twilio = require('twilio');
const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

class RegistrationRepository {
  async validatedToken(token, mobileNumber) {
    console.log("Validating token for mobile number:", mobileNumber);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.mobileNumber === mobileNumber) {
        console.log("mobile number verification successful for:", mobileNumber);
        return decoded.mobileNumber;
      }
    } catch (err) {
      console.error("Error validating token:", err);
    }
    return false;
  }
  async create(data) {
    const errors = [];
    if (
      !data.mobileVerficationToken ||
      !(await this.validatedToken(data.mobileVerficationToken, data.mobile))
    ) {
      errors.push("Mobile number verification failed.");
    }
    if (!data.firstName || !data.lastName)
      errors.push("First name and last name are required.");

    if (!data.gender)
      errors.push("Gender is required.");

    if (!data.dob)
      errors.push("Date of birth is required.");

    if (!data.rationCardNo)
      errors.push("Ration card number is required.");

    if (!data.spouseName)
      errors.push("Spouse name is required.");

    if (!data.spouseOccupation)
      errors.push("Spouse occupation is required.");

    if (!data.numberOfChildren)
      errors.push("Number of children is required.");

    if (!Array.isArray(data.children) || data.children.length === 0) {
      errors.push("Children details are required.");
    } else {
      data.children.forEach((child, index) => {
        if (!child.name)
          errors.push(`Child ${index + 1} name is required.`);

        if (!child.qualification)
          errors.push(`Child ${index + 1} qualification is required.`);
      });
    }

    if (!data.jobDescription)
      errors.push("Job description is required.");

    if (!data.mobile || !/^[0-9]{10}$/.test(data.mobile))
      errors.push("Valid 10-digit mobile number is required.");

    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email))
      errors.push("Valid email is required.");

    if (data.aadhaar && !/^[0-9]{12}$/.test(data.aadhaar))
      errors.push("Aadhaar must be 12 digits.");

    if (errors.length > 0)
      throw new Error(errors.join(" "));

    const counter = await RegistrationCounter.findByIdAndUpdate(
      { _id: "registrationId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    data.registrationId = counter.seq.toString().padStart(4, "0");

    return Registration.create(data);
  }
  async requestVerification(mobileNumber) {
    this.sendOtp("+91" + mobileNumber);
    return { message: "OTP sent to mobile number" };
  }
  async sendOtp(mobileNumber) {
    try {
      const verification = await client.verify.v2.services(process.env.VERIFY_SERVICE_SID)
        .verifications
        .create({
          to: mobileNumber, // Must be in E.164 format (e.g., +919876543210)
          channel: 'sms'
        });

      console.log(`OTP Sent! Status: ${verification.status}`);
      return verification;
    } catch (error) {
      console.error('Error sending OTP:', error);
    }
  }
  async checkOtp(phoneNumber, codeFromUser) {
    try {
      const verificationCheck = await client.verify.v2.services(process.env.VERIFY_SERVICE_SID)
        .verificationChecks
        .create({
          to: phoneNumber,
          code: codeFromUser
        });

      if (verificationCheck.status === 'approved') {
        console.log('User Verified Successfully!');
        return true;
      } else {
        console.log('Invalid OTP.');
        return false;
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
    }
  }
  async verifyOTP(mobileNumber, otp) {
    console.log("Signing token with mobileNumber:", mobileNumber);
    const token = this.generateTokenWithMobileNumber(mobileNumber);
    if (this.checkOtp("+91" + mobileNumber, otp)) {
      return { token };
    }
    return { message: "Invalid OTP" };
  }

  generateTokenWithMobileNumber(mobileNumber) {
    return jwt.sign(
      { mobileNumber },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  async submitRating(data) {
    return Rating.create(data);
  }
  async updateDashboardData(data) {
    return DashboardData.create(data);
  }
  findAll() {
    return Registration.find();
  }
  async getStates() {
    const usersCount = await UsersCount.findOneAndUpdate(
      {},
      { $inc: { numberOfUsers: 1 } },
      {
        new: true,
        upsert: true
      }
    );
    const queryFilter = {
      status: "APPROVED",
    };
    const approvedRegistration = await Registration.countDocuments(queryFilter);
    const result = await Rating.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 }
        }
      }
    ]);
    return {
      ApprovedRegistration: approvedRegistration,
      AverageRating: result[0].averageRating.toFixed(1),
      TotalRatings: result[0].totalRatings,
      VisitorsCount: usersCount.numberOfUsers,
      DashboardData: await DashboardData
        .find()
        .select("typeCode description -_id")
        .sort({ createdAt: -1 })
        .limit(10)

    };
  }
  async getAdminStates() {
    const usersCount = await UsersCount.findOne();
    const result = await Rating.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 }
        }
      }
    ]);
    return {
      TotalMembers: await Registration.countDocuments(),
      PendingRegistration: await Registration.countDocuments({ status: "PENDING" }),
      ApprovedRegistration: await Registration.countDocuments({ status: "APPROVED" }),
      RejectedRegistration: await Registration.countDocuments({ status: "REJECTED" }),
      AverageRating: result[0].averageRating.toFixed(1),
      TotalRatings: result[0].totalRatings,
      VisitorsCount: usersCount.numberOfUsers,
    };
  }
  async findAllWithFilters(
    filter,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  ) {
    const skip = (pageNumber - 1) * pageSize;

    let queryFilter = {};

    if (filter) {
      const regex = new RegExp(filter, "i");
      queryFilter = {
        $or: [
          { registrationId: regex },
          { firstName: regex },
          { middleName: regex },
          { lastName: regex },
          { gender: regex },
          { dob: regex },
          { age: regex },
          { maritalStatus: regex },
          { mobile: regex },
          { alternateMobile: regex },
          { email: regex },
          { aadhaar: regex },
          { subCaste: regex },
          { fatherName: regex },
          { fatherOccupation: regex },
          { motherName: regex },
          { motherOccupation: regex },
          { houseNo: regex },
          { street: regex },
          { city: regex },
          { mandal: regex },
          { taluka: regex },
          { village: regex },
          { villageGroup: regex },
          { qualification: regex },
          { course: regex },
          { status: regex },
        ],
      };
    }

    const data = await Registration.find(queryFilter)
      .sort({ [sortBy]: sortDirection === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const count = await Registration.countDocuments(queryFilter);

    return { data, count };
  }

  findById(id) {
    return Registration.findById(id);
  }
  updateStatus(id, status) {
    return Registration.findByIdAndUpdate(id, { status }, { new: true });
  }
  async findApproved(filter, pageNumber, pageSize, sortBy, sortDirection) {
    const skip = (pageNumber - 1) * pageSize;

    const queryFilter = {
      status: "APPROVED",
    };

    if (filter) {
      const regex = new RegExp(filter, "i");

      queryFilter.$or = [
        { registrationId: regex },
        { firstName: regex },
        { middleName: regex },
        { lastName: regex },
        { gender: regex },
        { maritalStatus: regex },
        { mobile: regex },
        { alternateMobile: regex },
        { email: regex },
        { aadhaar: regex },
        { subCaste: regex },
        { fatherName: regex },
        { fatherOccupation: regex },
        { motherName: regex },
        { motherOccupation: regex },
        { houseNo: regex },
        { street: regex },
        { city: regex },
        { mandal: regex },
        { taluka: regex },
        { village: regex },
        { villageGroup: regex },
        { qualification: regex },
        { course: regex },
      ];
    }

    const data = await Registration.find(queryFilter)
      .sort({ [sortBy]: sortDirection === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const count = await Registration.countDocuments(queryFilter);

    return { data, count };
  }
}

module.exports = new RegistrationRepository();
