// Registration repository
const Registration = require("../models/Registration");
const Rating = require("../models/Rating");
const UsersCount = require("../models/UsersCount");
const RegistrationCounter = require("../models/RegistrationCounter");

class RegistrationRepository {
  async create(data) {
    const errors = [];

    if (!data.firstName || !data.lastName) errors.push("First name and last name are required.");
    if (!data.gender) errors.push("Gender is required.");
    if (!data.dob) errors.push("Date of birth is required.");
    if (!data.mobile || !/^[0-9]{10}$/.test(data.mobile)) errors.push("Valid 10-digit mobile number is required.");
    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) errors.push("Valid email is required.");
    if (data.aadhaar && !/^[0-9]{12}$/.test(data.aadhaar)) errors.push("Aadhaar must be 12 digits.");

    if (errors.length > 0) {
      throw new Error(errors.join(" "));
    }
    const counter = await RegistrationCounter.findByIdAndUpdate(
      { _id: "registrationId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    data.registrationId = `${counter.seq.toString().padStart(4, "0")}`;
    return Registration.create(data);
  }
  async submitRating(data) {
    return Rating.create(data);
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
      visitorsCount: usersCount.numberOfUsers
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
