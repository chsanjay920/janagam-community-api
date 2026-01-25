// Registration service
const repo = require("../repositories/registration.repository");

exports.registerMember = (data) => repo.create(data);
exports.getAll = () => repo.findAll();
exports.approve = (id) => repo.updateStatus(id, "APPROVED");
exports.reject = (id) => repo.updateStatus(id, "REJECTED");
exports.getApproved = () => repo.findApproved();