const service = require("../services/registration.service");
const mongoose = require("mongoose");
const connectDB = require("../config/db");

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


// exports.healthcheck = async (_, res) => {
//   try {
//     const state = mongoose.connection.readyState;

//     res.json({
//       status: "ok",
//       mongoState: state,
//       connected: state === 1,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


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