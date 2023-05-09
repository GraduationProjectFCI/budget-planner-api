const express = require("express");
const router = express.Router();

const { login, register, confirmation } = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/confirmation", confirmation);

module.exports = router;
