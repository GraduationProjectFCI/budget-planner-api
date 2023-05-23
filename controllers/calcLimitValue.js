const expenses = require("../models/expenses");
const limits = require("../models/LimitSchema");
const Sheets = require("../models/sheetSchema");
const Labels = require("../models/LabelSchema");
const CalcLimitValue = async (user_id, sheet_id, methode) => {
  //get labels
  const labels = await Labels.find({
    user_id,
  });

  if (labels) {
    labels.map(async (item) => {
      let expensesSum = 0;
      const { label } = item;
      //get expenses
      const LabelExpenses = await expenses.find({
        user_id,
        label,
      });

      LabelExpenses.map((label) => {
        expensesSum += label.value;
      });

      //get limit
      const limit = await limits.findOne({
        user_id,
        label,
      });

      const sheet = await Sheets.findOne({
        _id: sheet_id,
      });

      console.log(expensesSum);

      if (sheet) {
        if (sheet.sheet_type === "export") {
          if (limit) {
            if (methode === "add") {
              limit.value += expensesSum;
            } else if (methode === "delete") {
              limit.value -= expensesSum;
            } else if (methode === "update") {
              limit.value += expensesSum - prevExpenseValue;
            }
            await limit.save();
          }
        }
      }
    });
  }
};

module.exports = CalcLimitValue;
