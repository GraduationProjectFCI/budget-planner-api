const Expenses = require("../models/expenses");
const Limits = require("../models/LimitSchema");
const Sheets = require("../models/sheetSchema");
const Labels = require("../models/LabelSchema");

const CalcLimitValue = async (user_id) => {
  const sheets = await Sheets.find({ user_id: user_id, sheet_type: "export" });

  if (sheets.length > 0) {
    const labels = await Labels.find({ user_id: user_id });
    const allLimits = await Limits.find({ user_id: user_id });

    const labelSums = sheets.reduce(async (sumsPromise, sheet) => {
      const sums = await sumsPromise;
      const expenses = await Expenses.find({ sheet_id: sheet._id });
      return expenses.reduce((innerSums, expense) => {
        if (expense.label in innerSums) {
          innerSums[expense.label] += expense.value;
        } else {
          innerSums[expense.label] = expense.value;
        }
        return innerSums;
      }, sums);
    }, {});

    async function updateLimits() {
      const labelsSums = await labelSums;

      for (const label of labels) {
        const labelSum = labelsSums[label.label] || 0;
        const limit = allLimits.find((limit) => limit.label === label.label);
        if (limit) {
          await Limits.findOneAndUpdate(
            { _id: limit._id },
            { limit_value: labelSum },
            { new: true }
          );
        }
      }
    }

    updateLimits();
  }
};

module.exports = CalcLimitValue;
