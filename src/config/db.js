const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI missing");
  }

  const db = await mongoose.connect(process.env.MONGO_URI, {
    bufferCommands: false,
  });

  isConnected = db.connections[0].readyState === 1;
};

module.exports = connectDB;
