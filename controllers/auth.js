const send_mail = require("../mails/send_mails");
const User = require("../models/user");
const Code = require("../models/code");
const UserData = require("../models/user_data_modal");

const jwt = require("jsonwebtoken");

// use the mongoose object id
var ObjectId = require("mongodb").ObjectId;

//check for uppercase letters
const isUpperCase = (string) => /^[A-Z]*$/.test(string);
function containsCapital(str) {
  var res = 0;
  for (let i = 0; i < str.length; i++)
    if (isUpperCase(str[i])) {
      res++;
    }
  return res;
}

const today = new Date();

//regester user
const register = async (req, res) => {
  var errorlist = [];

  try {
    ////////PASSWORD VALIDATION////////
    //Check if password contains special characters
    var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (!format.test(req.body.password)) {
      errorlist.push("must contain a special character");
    }

    //check if passwpord less than 8 characters
    if (req.body.password.length < 8) {
      errorlist.push("must contain at least 8 letters");
    }

    //check if password contains an upper case letter
    if (!containsCapital(req.body.password)) {
      errorlist.push("must contain capital letter");
    }

    ////////NAME VALIDATION////////
    //validate name
    if (!req.body.name) {
      errorlist.push("name must be provided");
    }

    //check if name more than 3 characters
    if (!req.body.name >= 3 && !req.body.name <= 50) {
      errorlist.push("name must be between 3 and 50 characters");
    }

    ////////EMAIL VALIDATION////////
    //check if email found
    if (!req.body.email) {
      errorlist.push("email must be provided");
    }

    //check if email is unique
    if (await (await User.find({ email: req.body.email })).length) {
      errorlist.push("this email is registered");
    }

    ////////Genger Vlaidation////////
    if (!req.body.gender) {
      errorlist.push("gender must be provided");
    }

    ////////BUDGET VALIDATION////////
    //check if budget found
    if (!req.body.budget) {
      errorlist.push("budget must be provided");
    }

    //check if budget is a number
    if (isNaN(req.body.budget)) {
      errorlist.push("budget must be a number");
    }

    //check if budget is a positive number
    if (req.body.budget < 0) {
      errorlist.push("budget must be a positive number");
    }

    ////////CURRENCY VALIDATION////////
    //check if currency found
    if (!req.body.currency) {
      errorlist.push("currency must be provided");
    }

    //check if currency is a string
    if (!isNaN(req.body.currency)) {
      errorlist.push("currency must be a string");
    }

    ////////BIRTHDATE VALIDATION////////
    //check if birthdate found
    if (!req.body.birthdate) {
      errorlist.push("birthdate must be provided");
    }

    //check if birthdate is a date
    if (isNaN(Date.parse(req.body.birthdate))) {
      errorlist.push("birthdate must be a date");
    }

    //check if there is no error
    if (errorlist.length)
      res.status(400).json({
        msg: errorlist,
      });
    else {
      //generate a number randomly of 6 digits
      const RandomCode = Math.floor(100000 + Math.random() * 900000);

      send_mail(RandomCode, req.body.email);

      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        gender: req.body.gender,
        currency: req.body.currency,
        budget: req.body.budget,
        birthdate: req.body.birthdate,
        account_age: today.toDateString(),
        active: false,
      });
      const newCode = await Code.create({
        code: RandomCode,
        email: req.body.email,
        user_id: user._id,
        createdAt: today.toDateString(),
      });

      //send user_id to the frontend
      res.status(200).json({
        msg: "user created",
        user_id: user._id,
      });
    }
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};

//login user
const login = async (req, res) => {
  const { email, password } = req.body;
  const errorlog = [];

  //check if email found
  if (!email) {
    errorlog.push("email must be provided");
  }

  //check if password found
  if (!password) {
    errorlog.push("password must be provided");
  }

  //if email and password found
  if (email && password) {
    //check if email is registered
    const user = await User.findOne({ email });

    //if email is not registered
    if (!user) {
      errorlog.push("user not found");
    }

    //if email is registered
    if (user) {
      //check if password is correct
      const isPasswordMatch = await user.comparePassword(password);
      //if password is not correct
      if (!isPasswordMatch) {
        errorlog.push("Wrong password");
      } else {
        //if password is correct
        const token = user.createJWT(); //create token
        res.status(200).json({
          msg: "logged in successfully",
          user: {
            name: user.name,
            user_id: user._id,
          },
          token,
        });
      }
    }
  }
  if (errorlog.length) {
    res.status(400).json({
      msg: errorlog,
    });
  }
};

const confirmation = async (req, res) => {
  const errorlog = [];

  const code = req.body.code;

  if (code) {
    errorlog.push("code must be provided");
  }

  if (req.body.user_id) {
    errorlog.push("user_id must be provided");
  }

  //find the code by user_id
  const code_created = await Code.findOne(
    { user_id: req.body.user_id },
    { used: false }
  );

  //check if the code is correct
  if (code_created.code == code) {
    //create token
    const user = await User.findOne({ _id: req.body.user_id });

    const token = user.createJWT();

    res.status(200).json({
      msg: "account activated",
      user: {
        name: user.name,
        id: user._id,
      },
      token,
    });

    //update the user to be active
    const response = await User.findOneAndUpdate(
      { _id: req.body.user_id },
      { active: true }
    );

    await UserData.create({
      user_id: response._id,
      total: response.budget,
      spent: 0,
      remaining: response.budget,
    });

    await Code.findOneAndUpdate({ user_id: req.body.user_id }, { used: true });
  } else {
    res.status(400).json({
      msg: "account not activated",
      error: errorlog,
    });
  }
};

module.exports = {
  register,
  login,
  confirmation,
};
