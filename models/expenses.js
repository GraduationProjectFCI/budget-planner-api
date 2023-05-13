const mongoose = require("mongoose");

const expensesScheme = new mongoose.Schema({
  sheet_id: mongoose.Types.ObjectId,
  value: Number,
  label: String,
  description: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("expenses", expensesScheme);
