// Admin controller
const bcrypt = require("bcryptjs");
const repo = require("../repositories/admin.repository");
const { generateToken } = require("../services/auth.service");

exports.login = async (req, res) => {
  const admin = await repo.findByEmail(req.body.email);
  if (!admin || !(await bcrypt.compare(req.body.password, admin.password)))
    return res.status(401).json({ message: "Invalid credentials" });

  res.json({ token: generateToken(admin) });
};
