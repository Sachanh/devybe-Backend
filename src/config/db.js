const mongoose = require("mongoose");
require("dotenv").config()


const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URL}`);
    console.log("MongoDB Connected Successfully");


  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1); 
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB Disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB Connection Error:", err);
});

module.exports = connectDB;
