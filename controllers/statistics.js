const Labels = require("../models/LabelSchema");
const Expenses = require("../models/expenses");
const UserData = require("../models/user_data_modal");
const States = require("../models/statesSchema");
const Sheets = require("../models/sheetSchema");

const DoStatistics = async (user_id) => {
  try {
    //delete the old statistics if found
    await States.deleteMany({ user_id: user_id });

    //User Total Budget
    const user_data = await UserData.findOne({ user_id: user_id });

    // get user labels
    const labels = await Labels.find({ user_id: user_id });

    //get user sheets with the type export
    const sheets = await Sheets.find({
      user_id: user_id,
      sheet_type: "export",
    });

    const allExportSheetExpenses = [];

    //get all expenses for each sheet
    for (const sheet of sheets) {
      const expenses = await Expenses.find({ sheet_id: sheet._id });
      if (expenses.length > 0) {
        allExportSheetExpenses.push(...expenses);
      }
    }

    if (labels.length > 0) {
      for (const label of labels) {
        let labelSum = 0;
        for (const expense of allExportSheetExpenses) {
          if (expense.label === label.label) {
            labelSum += expense.value;
          }
        }

        const labelPercentageTotal = user_data.total
          ? (labelSum / user_data.total) * 100
          : 0;
        const labelPercentageSpent = user_data.spent
          ? (labelSum / user_data.spent) * 100
          : 0;

        const newStatistics = new States({
          user_id: user_id,
          label: label.label,
          expensesSum: labelSum,
          labelPercentageTotal: labelPercentageTotal,
          labelPercentageSpent: labelPercentageSpent,
        });

        await newStatistics.save();
      }
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = DoStatistics;
