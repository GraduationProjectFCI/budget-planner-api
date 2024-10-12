const express = require("express");
const router = express.Router();

const appRouter = require("./app");
const authRouter = require("./auth");

router.use("/app", appRouter);
router.use("/auth", authRouter);

module.exports = router;
