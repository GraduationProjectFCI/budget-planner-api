const mongoose = require("mongoose");

const LimitScheme = new mongoose.Schema({
  user_id: mongoose.Types.ObjectId,
  label: String,
  limit: Number,
  value: {
    type: Number,
    default: 0,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("limits", LimitScheme);
