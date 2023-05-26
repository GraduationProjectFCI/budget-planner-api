const expenses = require("../models/expenses");
const limits = require("../models/LimitSchema");
const Sheets = require("../models/sheetSchema");
const Labels = require("../models/LabelSchema");
const CalcLimitValue = async (user_id, sheet_id, considerSheetType) => {
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

      if (considerSheetType) {
        if (sheet) {
          if (sheet.sheet_type === "export") {
            if (limit) {
              limit.value = expensesSum;
              await limit.save();
            }
          }
        }
      } else {
        if (limit) {
          limit.value = expensesSum;
          await limit.save();
        }
      }
    });
  }
};

module.exports = CalcLimitValue;
