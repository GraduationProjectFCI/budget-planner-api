const express = require("express");
require("dotenv").config();
const app = express();
const mongoose = require("mongoose");

// import created functions
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
    mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => {
        console.log("Connected to the Database");
        app.listen(port, "0.0.0.0", async () => {
          console.log(`app is listening on port :${port}`);
        });
      })
      .catch((err) => console.log(err));
  } catch (error) {
    console.log(error);
  }
};

start();
