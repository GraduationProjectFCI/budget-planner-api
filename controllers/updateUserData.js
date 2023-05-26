const Sheets = require("../models/sheetSchema");
const UserData = require("../models/user_data_modal");
const Expenses = require("../models/expenses");
const Lebels = require("../models/LabelSchema");

const UpdateUserData = async (user_id) => {
  let labelSums = {};

  for (const sheet of await Sheets.find({
    user_id: user_id,
    sheet_type: "export",
  })) {
    const expenses = await Expenses.find({ sheet_id: sheet._id });
    if (expenses.length > 0) {
      labelSums = expenses.reduce((sums, expense) => {
        if (expense.label in sums) {
          sums[expense.label] += expense.value;
        } else {
          sums[expense.label] = expense.value;
        }
        return sums;
      }, labelSums);
    }
  }

  //update user data if found
  const userData = await UserData.findOne({ user_id: user_id });
  if (userData) {
    let spent = 0;
    for (const label in labelSums) {
      spent += labelSums[label];
    }
    userData.spent = spent;
    userData.remaining = userData.total - spent;
    await userData.save();
  }
};

module.exports = UpdateUserData;
