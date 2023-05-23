const Sheets = require("../models/sheetSchema");
const UserData = require("../models/user_data_modal");
const UpdateUserData = async (
  user_id,
  expenseValue,
  methode,
  sheet_id,
  prevExpenseValue = 0
) => {
  const userData = await UserData.findOne({
    user_id,
  });

  const sheet = await Sheets.findOne({
    _id: sheet_id,
  });

  if (sheet) {
    if (sheet.sheet_type === "export") {
      if (userData) {
        if (methode === "add") {
          userData.spent += expenseValue;
          userData.remaining -= expenseValue;
        } else if (methode === "delete") {
          userData.spent -= expenseValue;
          userData.remaining += expenseValue;
        } else if (methode === "update") {
          userData.spent += expenseValue - prevExpenseValue;
          userData.remaining = userData.total - userData.spent;
        }
        await userData.save();
      }
    }
  }
};

module.exports = UpdateUserData;
