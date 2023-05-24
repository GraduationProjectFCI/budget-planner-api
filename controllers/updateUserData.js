const Sheets = require("../models/sheetSchema");
const UserData = require("../models/user_data_modal");
const Expenses = require("../models/expenses");
const UpdateUserData = async (user_id, sheet_id) => {
  const userData = await UserData.findOne({
    user_id,
  });

  const sheet = await Sheets.findOne({
    _id: sheet_id,
  });

  // get all expenses
  const expenses = await Expenses.find({
    user_id,
  });
  let expenses_value = 0;
  expenses.forEach((expense) => {
    expenses_value += expense.value;
  });

  if (sheet) {
    if (sheet.sheet_type === "export") {
      if (userData) {
        userData.spent = expenses_value;
        userData.remaining = userData.total - expenses_value;
        await userData.save();
      }
    }
  }
};

module.exports = UpdateUserData;
