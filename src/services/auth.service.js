// Authentication service
const jwt = require("jsonwebtoken");

exports.generateToken = (admin) => {
  return jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};
