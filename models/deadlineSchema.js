const mongoose = require("mongoose");

const DeadlineScheme = new mongoose.Schema({
  user_id: mongoose.Types.ObjectId,
  deadline_name: String,
  deadline_date: Date,
  deadline_value: Number,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("deadlines", DeadlineScheme);
