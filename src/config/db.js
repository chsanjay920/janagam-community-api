const mongoose = require("mongoose");

module.exports = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  console.log("MongoDB connected");
};

