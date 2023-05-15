const Lebels = require("../models/LabelSchema");
const Expenses = require("../models/expenses");
const UserData = require("../models/user_data_modal");
const statistics = require("../models/statesSchema");

const Do_Statistics = async (user_id) => {
  //delete the old statistics if found
  await statistics.deleteMany({ user_id: user_id });

  //User Total Budget
  const user_data = await UserData.findOne({ user_id: user_id });

  // get user labels
  const labels = await Lebels.find({ user_id: user_id });

  var labelsList = [];

  labels.forEach((label) => {
    labelsList.push(label.label);
  });

  //get user expenses
  labelsList.forEach(async (label) => {
    var expensesSum = 0;
    var labelPercentageTotal = 0;
    var labelPercentageSpent = 0;
    const expenses = await Expenses.find({
      user_id,
      label,
    });

    if (expenses.length > 0) {
      expenses.forEach((expense) => {
        expensesSum += expense.value;
      });

      //get the percentage of each label from the total budget

      //trim the number to only 2 numbers after the dot
      labelPercentageTotal = ((expensesSum / user_data.total) * 100).toFixed(2);

      //get the percentage of each label from the spent budget
      labelPercentageSpent = ((expensesSum / user_data.spent) * 100).toFixed(2);
    }

    // set the states in the states collection
    const state = new statistics({
      user_id,
      label,
      expensesSum,
      labelPercentageTotal,
      labelPercentageSpent,
    });
    await state.save();
  });
};

module.exports = Do_Statistics;
