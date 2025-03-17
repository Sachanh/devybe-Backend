const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      // unique: true, 
      trim: true, 
      minlength: 1 
    },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: true,
  }
);

module.exports = mongoose.model("Category", categorySchema);
