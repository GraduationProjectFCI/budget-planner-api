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

//added to the gateway servicee
router.route("/user-data").patch(update_user_data).get(get_user_data);

//not added
router.route("/labels").post(addLabels).get(getLabels);
router.route("/labels/:label_id").delete(deleteLabels);

router.route("/sheets").get(getSheets).post(addSheets);
router.route("/sheets/:sheet_id").delete(deleteSheets).patch(updateSheet);

router.route("/statistics").get(getStatistics);

router.route("/deadlines").post(addDeadline).get(getDeadlines);
router
  .route("/deadlines/:deadline_id")
  .delete(deleteDeadline)
  .patch(updateDeadline)
  .get(getOneDeadLine);

router.route("/expenses").post(addExpenses).get(getExpenses);
router
  .route("/expenses/:expense_id")
  .delete(deleteExpense)
  .patch(updateExpense);

router.route("/profile").get(getProfileData).patch(updateProfileData);
module.exports = router;
