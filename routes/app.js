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
  addStatistics,
  addDeadline,
  getDeadlines,
  deleteDeadline,
  updateDeadline,
  getOneDeadLine,
} = require("../controllers/app");

//added to the gateway servicee
router.route("/user-data").patch(update_user_data).get(get_user_data);

//not added
router.route("/labels").post(addLabels).get(getLabels);
router.route("/labels/:label_id").delete(deleteLabels);

router.route("/sheets").get(getSheets).post(addSheets);
router.route("/sheets/:sheet_id").delete(deleteSheets).patch(updateSheet);

router.route("/statistics").get(getStatistics).post(addStatistics);

router.route("/deadlines").post(addDeadline).get(getDeadlines);
router
  .route("/deadlines/:deadline_id")
  .delete(deleteDeadline)
  .patch(updateDeadline)
  .get(getOneDeadLine);

module.exports = router;
