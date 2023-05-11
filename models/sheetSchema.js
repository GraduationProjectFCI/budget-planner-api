const mongoose = require("mongoose");

const SheetScheme = new mongoose.Schema({
  user_id: mongoose.Types.ObjectId,
  sheet_type: String,
  value: Number,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("sheets", SheetScheme);
