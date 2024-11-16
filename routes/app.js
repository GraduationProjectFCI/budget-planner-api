const express = require("express");
const router = express.Router();

const {
  get_user_data,
  addLabels,
  getLabels,
  deleteLabel,
  getSheets,
  addSheets,
  deleteSheet,
  getStatistics,
  addDeadline,
  getDeadlines,
  deleteDeadline,
  updateDeadline,
  getOneDeadLine,
  getExpenses,
  addExpenses,
  deleteExpense,
  updateExpense,
  getProfileData,
  updateProfileData,
  addLimit,
  getLimits,
  deleteLimit,
  updateLimit,
  resetSpentBudget,
} = require("../controllers/app");

//added to the gateway servicee
router.route("/user-data").get(get_user_data);
router.route("/sheets").get(getSheets).post(addSheets);

router
  .route("/sheets/:sheet_id")
  .delete(deleteSheet)
  .post(addExpenses)
  .get(getExpenses);

router
  .route("/sheets/:sheet_id/:expense_id")
  .delete(deleteExpense)
  .patch(updateExpense);

router.route("/deadlines").post(addDeadline).get(getDeadlines);
router
  .route("/deadlines/:deadline_id")
  .delete(deleteDeadline)
  .patch(updateDeadline)
  .get(getOneDeadLine);

router.route("/labels").post(addLabels).get(getLabels);
router.route("/labels/:label_id").delete(deleteLabel);

router.route("/statistics").get(getStatistics);

router.route("/profile").get(getProfileData).patch(updateProfileData);

router.route("/limits").post(addLimit).get(getLimits);
router.route("/limits/:limit_id").delete(deleteLimit).patch(updateLimit);

router.route("/reset-spent-budget").post(resetSpentBudget);

module.exports = router;
