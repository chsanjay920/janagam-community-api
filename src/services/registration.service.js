// Registration service
const repo = require("../repositories/registration.repository");

exports.registerMember = (data) => repo.create(data);
exports.submitRating = (data) => repo.submitRating(data);
exports.getAll = () => repo.findAll();
exports.getGridList = async (filter,pagenumber,pagesize,sortby,sortdirection) => await repo.findAllWithFilters(filter,pagenumber,pagesize,sortby,sortdirection);
exports.approve = (id) => repo.updateStatus(id, "APPROVED");
exports.reject = (id) => repo.updateStatus(id, "REJECTED");
exports.getApproved = async (filter,pagenumber,pagesize,sortby,sortdirection) => repo.findApproved(filter,pagenumber,pagesize,sortby,sortdirection);