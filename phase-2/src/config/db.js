const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/coolneighbour";

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    isConnected = false;
    console.error("MongoDB connection failed:", err.message);
    console.error("Operating in resilient in-memory mode.");
  }

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
  });
}

function getIsConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

module.exports = connectDB;
module.exports.getIsConnected = getIsConnected;
