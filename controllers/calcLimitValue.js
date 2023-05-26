const expenses = require("../models/expenses");
const limits = require("../models/LimitSchema");
const Sheets = require("../models/sheetSchema");
const Labels = require("../models/LabelSchema");
const CalcLimitValue = async (user_id) => {
  //get all user sheets in type export
  const sheets = await Sheets.find({ user_id: user_id, sheet_type: "export" });

  //get all user expenses if there are sheets
  if (sheets.length > 0) {
    const allExportSheetsExpenses = [];
    sheets.forEach(async (sheet) => {
      const expenses = await Expenses.find({ sheet_id: sheet._id });
      if (expenses.length > 0) {
        expenses.forEach(async (expense) => {
          allExportSheetsExpenses.push(expense);
        });
      }
    });

    //get all user labels
    const labels = await Labels.find({ user_id: user_id });

    //get all user limits
    const allLimits = await limits.find({ user_id: user_id });

    // calculate the sum of each label expenses
    if (labels.length > 0) {
      labels.forEach(async (label) => {
        let labelSum = 0;
        allExportSheetsExpenses.map((expense) => {
          if (expense.label === label.label) {
            labelSum += expense.value;
          }
        });

        //get the limit of each label value if there are limits
        if (allLimits.length > 0) {
          allLimits.forEach(async (limit) => {
            if (limit.label === label.label) {
              limit.limit_value = labelSum;
              await limit.save();
            }
          });
        }
      });
    }
  }
};

module.exports = CalcLimitValue;
