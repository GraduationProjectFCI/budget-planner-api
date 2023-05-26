const Lebels = require("../models/LabelSchema");
const Expenses = require("../models/expenses");
const UserData = require("../models/user_data_modal");
const statistics = require("../models/statesSchema");
const Sheets = require("../models/sheetSchema");

const Do_Statistics = async (user_id) => {
  //delete the old statistics if found
  statistics.deleteMany({ user_id: user_id }).then(async () => {
    //User Total Budget
    const user_data = await UserData.findOne({ user_id: user_id });

    // get user labels

    const allExportSheetExpenses = [];

    //get user sheets with the type export
    const sheets = await Sheets.find({
      user_id: user_id,
      sheet_type: "export",
    });

    //get all expenses for each sheet
    sheets.forEach(async (sheet) => {
      const expenses = await Expenses.find({ sheet_id: sheet._id });
      if (expenses.length > 0) {
        expenses.forEach(async (expense) => {
          allExportSheetExpenses.push(expense);
        });
      }
    });

    const labels = await Lebels.find({ user_id: user_id });

    if (labels.length > 0) {
      labels.forEach(async (label) => {
        let labelSum = 0;
        allExportSheetExpenses.map((expense) => {
          if (expense.label === label.label) {
            labelSum += expense.value;
          }
        });

        //solve the problem of dividing by zero
        if (user_data.total === 0) {
          user_data.total = 1;
        }
        if (user_data.spent === 0) {
          user_data.spent = 1;
        }

        const labelPercentageTotal = (labelSum / user_data.total) * 100;
        const labelPercentageSpent = (labelSum / user_data.spent) * 100;

        const newStatistics = new statistics({
          user_id: user_id,
          label: label.label,
          expensesSum: labelSum,
          labelPercentageTotal: labelPercentageTotal,
          labelPercentageSpent: labelPercentageSpent,
        });

        await newStatistics.save();
      });
    }
  });
};

module.exports = Do_Statistics;
