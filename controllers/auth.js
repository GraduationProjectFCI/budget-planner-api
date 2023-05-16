const send_mail = require("../mails/send_mails");
const User = require("../models/user");
const Code = require("../models/code");
const UserData = require("../models/user_data_modal");

const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

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
  const { name, currency, birthdate, email, password, gender, budget } =
    req.body;

  const gender_var = gender.toLowerCase();

  var errorlist = [];

  try {
    ////////PASSWORD VALIDATION////////
    //Check if password contains special characters
    var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

    if (!password) {
      errorlist.push("password must be provided");
    } else {
      //check if password more than 8 characters
      if (password.length < 8) {
        errorlist.push("password must be more than 8 characters");
      }
      //check if password contains special characters
      if (!format.test(password)) {
        errorlist.push("password must contain special characters");
      }
      //check if password contains numbers
      if (!/\d/.test(password)) {
        errorlist.push("password must contain numbers");
      }
      //check if password contains uppercase letters
      if (containsCapital(password) < 1) {
        errorlist.push("password must contain uppercase letters");
      }
    }

    ////////NAME VALIDATION////////
    //validate name
    if (!name) {
      errorlist.push("name must be provided");
    } else {
      //check if name more than 3 characters
      if (!name >= 3 && !name <= 50) {
        errorlist.push("name must be between 3 and 50 characters");
      }
    }

    ////////EMAIL VALIDATION////////
    //check if email found
    if (!email) {
      errorlist.push("email must be provided");
    } else {
      //check if email is registered
      if (await User.findOne({ email: email })) {
        errorlist.push("email is already registered");
      }

      //check if email is a string
      if (!isNaN(email)) {
        errorlist.push("email must be a string");
      }
      //check if email is a valid email
      if (!/\S+@\S+\.\S+/.test(email)) {
        errorlist.push("email must be a valid email");
      }
    }

    ////////Genger Vlaidation////////
    if (!gender) {
      errorlist.push("gender must be provided");
    }

    ////////BUDGET VALIDATION////////
    //check if budget found
    if (!budget) {
      errorlist.push("budget must be provided");
    } else {
      //check if budget is a number
      if (isNaN(budget)) {
        errorlist.push("budget must be a number");
      }
      //check if budget is a positive number
      if (budget < 0) {
        errorlist.push("budget must be a positive number");
      }
    }

    ////////CURRENCY VALIDATION////////
    //check if currency found
    if (!currency) {
      errorlist.push("currency must be provided");
    } else {
      //check if currency is a string
      if (!isNaN(currency)) {
        errorlist.push("currency must be a string");
      }
    }

    ////////BIRTHDATE VALIDATION////////
    //check if birthdate found
    if (!birthdate) {
      errorlist.push("birthdate must be provided");
    } else {
      //check if birthdate is a string
      if (!isNaN(birthdate)) {
        errorlist.push("birthdate must be a string");
      }
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
        name,
        email,
        password,
        gender: gender_var,
        currency,
        budget,
        birthdate,
        image: "",
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
    } else {
      //if email is registered
      //check if password is correct
      const isPasswordMatch = await user.comparePassword(password);

      //if password is not correct
      if (!isPasswordMatch) {
        errorlog.push("password is not correct");
      } else {
        //if password is correct
        //check if user is active
        if (!user.active) {
          errorlog.push("user is not active");
        } else {
          //send the user data and token in the response
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

    //if there is an error
    if (errorlog.length) {
      res.status(400).json({
        msg: errorlog,
      });
    }
  }
};

const confirmation = async (req, res) => {
  const errorlog = [];

  const { code, user_id } = req.body;

  //check if code found
  if (!code) {
    errorlog.push("code must be provided");
  }

  //check if user_id found
  if (!user_id) {
    errorlog.push("user_id must be provided");
  } else {
    //check if user_id is a string
    if (!isNaN(user_id)) {
      errorlog.push("user_id must be a string");
    }

    //check if user_id is a valid id
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      errorlog.push("user_id must be a valid id");
    }
  }

  if (errorlog.length) {
    res.status(400).json({
      msg: errorlog,
    });
  } else {
    try {
      const user = await User.findOne({
        _id: user_id,
      });

      if (user) {
        if (user.active) {
          res.status(400).json({
            msg: "user already activated",
          });
        } else {
          const codeFound = await Code.findOne(
            {
              code,
              user_id,
            },
            {
              used: false,
            }
          );
          if (codeFound) {
            await User.findOneAndUpdate({ _id: user_id }, { active: true });
            code.used = true;
            await codeFound.save();

            const userData = new UserData({
              user_id: user._id,
              name: user.name,
              total: user.budget,
              spent: 0,
              remaining: user.budget,
            });

            await userData.save();

            //create a token for user
            const token = user.createJWT();

            res.status(200).json({
              msg: "user activated",
              user: {
                name: user.name,
                user_id: user._id,
              },
              token,
            });
          } else {
            res.status(400).json({
              msg: "code not found",
            });
          }
        }
      } else {
        res.status(400).json({
          msg: "user not found",
        });
      }
    } catch (error) {
      res.status(500).json({
        msg: error.message,
      });
    }
  }
};

module.exports = {
  register,
  login,
  confirmation,
};
