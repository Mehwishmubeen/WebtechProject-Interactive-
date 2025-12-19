// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");

// Default to local MongoDB if no URI is provided
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/BeinteractiveDB";

// Connect to MongoDB
mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected", { uri }))
  .catch((err) => console.error("MongoDB connection error", err));

module.exports = mongoose.connection;
