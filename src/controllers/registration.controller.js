const service = require("../services/registration.service");
const mongoose = require("mongoose");
const connectDB = require("../config/db");

exports.create = async (req, res) => {
  await connectDB();
  res.status(201).json(await service.registerMember(req.body));
};
exports.submitRating = async (req, res) => {
  await connectDB();
  var ip = req.headers["x-forwarded-for"]?.split(",")[0] || 
    req.socket?.remoteAddress ||
    req.ip ||
    "";
  req.body.ipAddress = ip;
  req.body.createdDateTime = new Date();
  res.status(201).json(await service.submitRating(req.body));
};

exports.list = async (_, res) => {
  await connectDB();
  res.json(await service.getAll());
};

exports.gridlist = async (req, res) => {
  await connectDB();
  res.json(await service.getGridList(req.query.filter, req.query.pagenumber, req.query.pagesize, req.query.sortby, req.query.sortdirection));
};

exports.approve = async (req, res) => {
  await connectDB();
  res.json(await service.approve(req.params.id));
};

exports.reject = async (req, res) => {
  await connectDB();
  res.json(await service.reject(req.params.id));
};

exports.publicList = async (req, res) => {
  await connectDB();
  res.json(await service.getApproved(req.query.filter, req.query.pagenumber, req.query.pagesize, req.query.sortby, req.query.sortdirection));
};


exports.healthcheck = async (req, res) => {
  try {
    await connectDB();

    const state = mongoose.connection.readyState;

    return res.json({
      mongoState: state,
      connected: state === 1,
    });
  } catch (err) {
    console.error("Mongo error:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
};