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


    const queryFilter = filter || {};

    console.log(queryFilter, pageNumber, pageSize, sortBy, sortDirection);

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
