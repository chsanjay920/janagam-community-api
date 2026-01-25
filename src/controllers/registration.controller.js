const service = require("../services/registration.service");

exports.create = async (req, res) => {
  res.status(201).json(await service.registerMember(req.body));
};

exports.list = async (_, res) => {
  res.json(await service.getAll());
};

exports.approve = async (req, res) => {
  res.json(await service.approve(req.params.id));
};

exports.reject = async (req, res) => {
  res.json(await service.reject(req.params.id));
};

exports.publicList = async (_, res) => {
  res.json(await service.getApproved());
};
