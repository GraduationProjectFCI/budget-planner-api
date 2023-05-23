const Expenses = require("../models/expenses");
const Sheet = require("../models/sheetSchema");
const SheetValue = async (sheet_id) => {
  const expenses = await Expenses.find({ sheet_id });
  const sheet = await Sheet.findOne({ _id: sheet_id });
  let value = 0;
  expenses.forEach((expense) => {
    value += expense.value;
  });

  if (sheet) {
    sheet.value = value;
    await sheet.save();
  }
};

module.exports = SheetValue;
