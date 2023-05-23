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
      if (methode === "add") {
        userData.total += expenseValue;
      } else if (methode === "delete") {
        userData.total -= expenseValue;
      } else if (methode === "update") {
        userData.total += expenseValue - prevExpenseValue;
      }
    }
    await userData.save();
  }
};

module.exports = UpdateUserData;
