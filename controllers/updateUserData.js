const Sheets = require("../models/sheetSchema");
const UserData = require("../models/user_data_modal");
const Expenses = require("../models/expenses");
const UpdateUserData = async (user_id) => {
  const userData = await UserData.findOne({
    user_id,
  });

  //get all sheets of type export
  const sheets = await Sheets.find({
    user_id,
    sheet_type: "export",
  });

  //get all expenses of each sheet
  const allExportSheetsExpenses = [];

  if (sheets.length > 0) {
    sheets.forEach(async (sheet) => {
      const expenses = await Expenses.find({
        sheet_id: sheet._id,
      });
      if (expenses.length > 0) {
        expenses.forEach(async (expense) => {
          allExportSheetsExpenses.push(expense);
        });
      }
    });

    //calculate the total value of all sheets
    let spent = 0;
    allExportSheetsExpenses.forEach((expense) => {
      spent += expense.value;
    });

    // update userData if found
    if (userData) {
      userData.spent = spent;
      userData.remaining = userData.total - userData.spent;
      await userData.save();
    }
  }
};

module.exports = UpdateUserData;
