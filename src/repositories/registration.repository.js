// Registration repository
const Registration = require("../models/Registration");
const RegistrationCounter = require(
  "../models/RegistrationCounter"
);

class RegistrationRepository {
  async create(data) {
    const counter = await RegistrationCounter.findByIdAndUpdate(
      { _id: "registrationId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    data.registrationId = `${counter.seq.toString().padStart(4, "0")}`;
    return Registration.create(data);
  }
  findAll() {
    return Registration.find();
  }
  async findAllWithFilters(filter, pageNumber, pageSize, sortBy, sortDirection) {
  const skip = (pageNumber - 1) * pageSize;

  let queryFilter = {};

  if (filter) {
    const regex = new RegExp(filter, 'i'); 
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
        { status: regex }
      ]
    };
  }

  const data = await Registration.find(queryFilter)
    .sort({ [sortBy]: sortDirection === 'desc' ? -1 : 1 })
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
  findApproved() {
    return Registration.find({ status: "APPROVED" });
  }
}

module.exports = new RegistrationRepository();
