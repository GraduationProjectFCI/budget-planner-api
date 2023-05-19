const express = require("express");
const router = express.Router();

const {
  login,
  register,
  confirmation,
  forgetPassword,
} = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/confirmation", confirmation);
router.post("/forget-password", forgetPassword);

module.exports = router;
