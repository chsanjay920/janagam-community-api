const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGO_URI;

  const db = await mongoose.connect(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000, 
    socketTimeoutMS: 45000,
    family: 4, 
    tls: true,
  });

  isConnected = db.connections[0].readyState === 1;
};

module.exports = connectDB;
