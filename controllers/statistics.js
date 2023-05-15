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

  const userLabels = [];
  labels.map((label) => {
    if (!userLabels.includes(label.label)) userLabels.push(label.label);
  });
  // get user expenses
  userLabels.map(async (label) => {
    //food --> 400

    var total_Expenses = 0;
    var total_Spent = 0;
    var total_Budget = 0;

    const expenses = await Expenses.find({ label: label });
    if (!expenses) {
      return;
    }
    expenses.map((expense) => {
      total_Expenses += expense.value;
    });

    total_Spent = (total_Expenses / user_data.spent) * 100;
    total_Budget = (total_Expenses / user_data.total) * 100;

    total_Spent = total_Spent.toFixed(2);
    total_Budget = total_Budget.toFixed(2);

    const statistics_data = {
      user_id,
      label,
      total_Expenses,
      total_Spent,
      total_Budget,
    };
    await statistics.create(statistics_data);
  });
};

module.exports = Do_Statistics;
