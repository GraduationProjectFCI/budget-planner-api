const express = require("express");
const router = express.Router();

const {
  update_user_data,
  get_user_data,
  addLabels,
  getLabels,
  deleteLabels,
  getSheets,
  addSheets,
  deleteSheets,
  updateSheet,
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
} = require("../controllers/app");
const expenses = require("../models/expenses");

//added to the gateway servicee
router.route("/user-data").get(get_user_data);
router.route("/sheets").get(getSheets).post(addSheets);

router
  .route("/sheets/:sheet_id")
  .delete(deleteSheets)
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
router.route("/labels/:label_id").delete(deleteLabels);

router.route("/statistics").get(getStatistics);

router.route("/profile").get(getProfileData).patch(updateProfileData);
module.exports = router;
