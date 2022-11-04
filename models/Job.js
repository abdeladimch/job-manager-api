const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    //u need to perform advanced validation and sanitization just to prevent from xss
    company: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "interviewing", "rejected", "passed"],
      default: "pending",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
