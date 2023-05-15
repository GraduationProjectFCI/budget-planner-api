const mongoose = require("mongoose");

const StatesScheme = new mongoose.Schema({
  user_id: mongoose.Types.ObjectId,
  label: String,
  expensesSum: Number,
  labelPercentageTotal: Number,
  labelPercentageSpent: Number,

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("statistics", StatesScheme);
