const express = require("express");
require("dotenv").config();
const app = express();

// import created functions
const connectDB = require("./db/connection");
const authRouter = require("./routes/auth");
const appRouter = require("./routes/app");

// use express.json() to parse JSON bodies into JS objects
app.use(express.json());

//routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/app", appRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const start = async () => {
  const port = 3000;
  try {
    app.listen(port, "0.0.0.0", async () => {
      await connectDB(process.env.MONGODB_URI);
      console.log(`app is listening on port :${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
