const mongoose = require("mongoose");

const LabelScheme = new mongoose.Schema({
  user_id: mongoose.Types.ObjectId,
  label: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("labels", LabelScheme);
