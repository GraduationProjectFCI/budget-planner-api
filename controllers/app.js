const UserData = require("../models/user_data_modal");
const Labels = require("../models/LabelSchema");
const Sheets = require("../models/sheetSchema");
const Deadlines = require("../models/deadlineSchema");
const Expenses = require("../models/expenses");
const User = require("../models/user");
const statistics = require("../models/statesSchema");
const Limit = require("../models/LimitSchema");
const SheetValue = require("./SheetValue");
const DoStatistics = require("./statistics");
const UpdateUserData = require("./updateUserData");
const CalcLimitValue = require("./calcLimitValue");

const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");

// ######## Limits ##########
const deleteLimit = (req, res) => {
  const errorLog = [];

  const { limit_id } = req.params;
  // validate bearer token in the request headers
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, async (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!authData.userId) {
            errorLog.push("user_id is required");
          }

          if (!limit_id) {
            errorLog.push("limit_id is required");
          }

          //check if id passed in the params is valid for the mongo
          if (!mongoose.Types.ObjectId.isValid(limit_id)) {
            errorLog.push("limit_id is not valid");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            const deletedLimit = await Limit.findOneAndDelete({
              _id: limit_id,
            });
            res.status(200).json({
              msg: "Limit Deleted Successfully",
              deletedLimit,
            });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

const updateLimit = (req, res) => {
  const errorLog = [];

  const { limit_id } = req.params;
  const { limit } = req.body;
  // validate bearer token in the request headers
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, async (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!authData.userId) {
            errorLog.push("user_id is required");
          }

          if (!limit_id) {
            errorLog.push("limit_id is required");
          } else {
            //check if id passed in the params is valid for the mongo
            if (!mongoose.Types.ObjectId.isValid(limit_id)) {
              errorLog.push("limit_id is not valid");
            }
            const limit = await Limit.findOne({
              _id: limit_id,
            });
            if (!limit) {
              errorLog.push("limit_id is not valid");
            }
          }

          if (!limit) {
            errorLog.push("limit value is required");
          }

          //limit value must be a number
          if (isNaN(limit)) {
            errorLog.push("limit value must be a number");
          }

          //limit value must be a positive number
          if (limit < 0) {
            errorLog.push("limit value must be a positive number");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            const updatedLimit = await Limit.findOneAndUpdate(
              {
                _id: limit_id,
              },
              {
                limit,
              },
              {
                new: true,
              }
            );
            res.status(200).json({
              msg: "Limit Updated Successfully",
              updatedLimit,
            });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

const getLimits = (req, res) => {
  const errorLog = [];
  // validate bearer token in the request headers
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, async (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!authData.userId) {
            errorLog.push("user_id is required");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            await CalcLimitValue(authData.userId);
            const limits = await Limit.find({
              user_id: authData.userId,
            });
            res.status(200).json({
              msg: "success",
              limits,
            });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

const addLimit = (req, res) => {
  const errorLog = [];
  const { label, limit } = req.body;
  // validate bearer token in the request headers
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, async (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!authData.userId) {
            errorLog.push("user_id is required");
          }
          if (!label) {
            errorLog.push("label is required");
          } else {
            //check if label found in the user labels
            const userLabels = await Labels.findOne({
              user_id: authData.userId,
              label,
            });
            if (userLabels) {
              if (!userLabels.label === label) {
                errorLog.push("label not found");
              }
            } else {
              errorLog.push("label not found");
            }
          }
          if (!limit) {
            errorLog.push("limit value is required");
          }
          //check if limit found
          const userLimit = await Limit.findOne({
            user_id: authData.userId,
            label,
          });

          if (userLimit) {
            errorLog.push("limit already exists");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            const newLimit = new Limit({
              user_id: authData.userId,
              label,
              limit,
            });
            await newLimit.save();

            res.status(200).json({
              msg: "Limit Added Successfully",
              newLimit,
            });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

// ######## USER Profile ##########
const getProfileData = (req, res) => {
  const errorLog = [];
  // validate bearer token in the request headers
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, async (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!authData.userId) {
            errorLog.push("user_id is required");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            const userData = await User.findOne({
              _id: authData.userId,
            })
              .select("-password")
              .select("-_id")
              .select("-__v");

            res.status(200).json({
              msg: "success",
              userData,
            });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

const updateProfileData = (req, res) => {
  const { name, budget, currency } = req.body;
  const errorLog = [];
  // validate bearer token in the request headers
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, async (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!authData.userId) {
            errorLog.push("user_id is required");
          }

          if (!name) {
            errorLog.push("name is required");
          }

          if (!budget) {
            errorLog.push("budget is required");
          }

          if (!currency) {
            errorLog.push("currency is required");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            const userData = await User.findOneAndUpdate(
              {
                _id: authData.userId,
              },
              {
                name,
                budget,
                currency: currency.toUpperCase(),
              },
              {
                new: true,
              }
            ).then(
              //update the budget in the user data
              async () => {
                const userData = await UserData.findOne({
                  user_id: authData.userId,
                });
                userData.total = budget;
                await userData.save();
              }
            );
            res.status(200).json({
              msg: "updated Successfully",
              userData,
            });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

// ######## EXPENSES ##########
const addExpenses = (req, res) => {
  const { sheet_id } = req.params;
  const errorLog = [];
  const { value, label, description } = req.body;

  // validate bearer token in the request headers
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, async (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!authData.userId) {
            errorLog.push("user_id is required");
          }
          if (!sheet_id) {
            errorLog.push("sheet_id is required");
          }
          if (!value) {
            errorLog.push("value is required");
          } else {
            //value must be a number
            if (isNaN(value)) {
              errorLog.push("value must be a number");
            }

            //value must be a positive number
            if (value < 0) {
              errorLog.push("value must be a positive number");
            }
          }

          if (!label) {
            errorLog.push("label is required");
          }

          //check if label found in the user labels
          const userLabels = await Labels.findOne({
            user_id: authData.userId,
          });

          if (!userLabels.label === label) {
            errorLog.push("label not found");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            const newExpense = new Expenses({
              user_id: authData.userId,
              sheet_id,
              value,
              label,
              description,
            });
            await newExpense.save().then(async () => {
              await SheetValue(sheet_id);
              await UpdateUserData(authData.userId);
              await CalcLimitValue(authData.userId);
              await DoStatistics(authData.userId);
            });

            res.status(200).json({
              msg: "Expense Added Successfully",
              newExpense,
            });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

const getExpenses = (req, res) => {
  const errorLog = [];
  const { label } = req.body;
  const { sheet_id } = req.params;
  // validate bearer token in the request headers
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, async (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (label) {
            const expenses = await Expenses.find({
              sheet_id,
              label,
            });
            if (expenses.length > 0) {
              res.status(200).json({
                msg: "Expenses Fetched Successfully",
                expenses,
              });
            } else {
              res.status(404).json({
                msg: "No Expenses Found",
                data,
              });
            }
          } else {
            Expenses.find({
              sheet_id,
            })
              .then((data) => {
                res.status(200).json({
                  msg: "Expenses Fetched Successfully",
                  data,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  msg: "Something went wrong",
                });
              });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

const deleteExpense = (req, res) => {
  const errorLog = [];
  const { expense_id, sheet_id } = req.params;
  // validate bearer token in the request headers
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, async (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!sheet_id) {
            errorLog.push("sheet_id is required");
          }

          //check if id passed in the params is valid for the mongo
          if (!mongoose.Types.ObjectId.isValid(sheet_id)) {
            errorLog.push("sheet_id is not valid");
          }

          if (!expense_id) {
            errorLog.push("expense_id is required");
          }

          //check if id passed in the params is valid for the mongo
          if (!mongoose.Types.ObjectId.isValid(expense_id)) {
            errorLog.push("expense_id is not valid");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            const expense = await Expenses.findOne({
              _id: expense_id,
            });
            if (!expense) {
              res.status(400).json({
                msg: "Expense does not exist",
              });
            } else {
              // delete expense
              await expense
                .deleteOne({
                  _id: expense_id,
                })
                .then(async () => {
                  await DoStatistics(authData.userId);
                  await SheetValue(sheet_id);
                  await UpdateUserData(authData.userId);
                  await CalcLimitValue(authData.userId);
                  res.status(200).json({
                    msg: "Expense Deleted Successfully",
                  });
                });
            }
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

const updateExpense = (req, res) => {
  const errorLog = [];
  const { expense_id, sheet_id } = req.params;
  const { value, label, description } = req.body;
  // validate bearer token in the request headers
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, async (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!sheet_id) {
            errorLog.push("sheet_id is required");
          }

          //check if id passed in the params is valid for the mongo
          if (!mongoose.Types.ObjectId.isValid(sheet_id)) {
            errorLog.push("sheet_id is not valid");
          }
          if (!expense_id) {
            errorLog.push("expense_id is required");
          }

          //check if id passed in the params is valid for the mongo
          if (!mongoose.Types.ObjectId.isValid(expense_id)) {
            errorLog.push("expense_id is not valid");
          }

          if (!value) {
            errorLog.push("value is required");
          } else {
            //value must be a number
            if (isNaN(value)) {
              errorLog.push("value must be a number");
            }

            //value must be a positive number
            if (value < 0) {
              errorLog.push("value must be a positive number");
            }
          }

          if (!label) {
            errorLog.push("label is required");
          } else {
            const userLabels = await Labels.findOne({
              user_id: authData.userId,
            });

            if (!userLabels.label === label) {
              errorLog.push("label not found");
            }
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            const expense = await Expenses.findOne({
              _id: expense_id,
            });

            if (!expense) {
              res.status(400).json({
                msg: "Expense does not exist",
              });
            }

            await Expenses.findOneAndUpdate(
              {
                _id: expense_id,
              },
              {
                value,
                label,
                description,
              }
            ).then(async () => {
              await UpdateUserData(authData.userId);
              await DoStatistics(authData.userId);
              await CalcLimitValue(authData.userId);
              await SheetValue(sheet_id);
            });

            res.status(200).json({
              msg: "Expense Updated Successfully",
              expense,
            });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

// ######## DEADLINES ##########
const addDeadline = (req, res) => {
  const errorLog = [];
  const { deadline_name, deadline_value } = req.body;
  const deadline_date = new Date(req.body.deadline_date);

  // validate bearer token in the request headers
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!authData.userId) {
            errorLog.push("user_id is required");
          }

          if (!deadline_name) {
            errorLog.push("deadline_name is required");
          }
          if (!deadline_date) {
            errorLog.push("deadline_date is required");
          }
          if (!deadline_value) {
            errorLog.push("deadline_value is required");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            const newDeadline = new Deadlines({
              user_id: authData.userId,
              deadline_name,
              deadline_date,
              deadline_value,
            });
            newDeadline
              .save()
              .then((data) => {
                res.status(200).json({
                  msg: "Deadline Added Successfully",
                  data,
                });
              })
              .catch((err) => {
                // console.log(err);
                res.status(500).json({
                  msg: "Something went wrong",
                });
              });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

const getOneDeadLine = (req, res) => {
  const errorLog = [];
  const { deadline_id } = req.params;

  //validate bearer token
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!deadline_id) {
            errorLog.push("deadline_id is required");
          }

          //check if id passed in the params is valid for the mongo
          if (!mongoose.Types.ObjectId.isValid(deadline_id)) {
            errorLog.push("deadline_id is not valid");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            Deadlines.findOne({ _id: deadline_id })
              .then((data) => {
                res.status(200).json({
                  msg: "Deadline Fetched Successfully",
                  data,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  msg: "Something went wrong",
                });
              });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

const getDeadlines = (req, res) => {
  const errorLog = [];

  //validate bearer token
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];

      jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!authData.userId) {
            errorLog.push("user_id is required");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            Deadlines.find({ user_id: authData.userId })
              .then((data) => {
                res.status(200).json({
                  msg: "Deadline Fetched Successfully",
                  data,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  msg: "Something went wrong",
                });
              });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

const updateDeadline = (req, res) => {
  const errorLog = [];

  const { deadline_id } = req.params;
  const { deadline_name, deadline_date, deadline_value } = req.body;

  //validate bearer token
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!deadline_id) {
            errorLog.push("deadline_id is required");
          }

          //check if id passed in the params is valid for the mongo
          if (!mongoose.Types.ObjectId.isValid(deadline_id)) {
            errorLog.push("deadline_id is not valid");
          }

          if (!deadline_name) {
            errorLog.push("deadline_name is required");
          }
          if (!deadline_date) {
            errorLog.push("deadline_date is required");
          }
          if (!deadline_value) {
            errorLog.push("deadline_value is required");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            Deadlines.updateOne(
              { _id: deadline_id },
              { deadline_name, deadline_date, deadline_value }
            )
              .then((data) => {
                res.status(200).json({
                  msg: "Deadline Updated Successfully",
                  data,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  msg: "Something went wrong",
                });
              });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

const deleteDeadline = (req, res) => {
  const errorLog = [];
  const { deadline_id } = req.params;

  //validate bearer token
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!deadline_id) {
            errorLog.push("deadline_id is required");
          }

          //check if id passed in the params is valid for the mongo
          if (!mongoose.Types.ObjectId.isValid(deadline_id)) {
            errorLog.push("deadline_id is not valid");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            Deadlines.deleteOne({ _id: deadline_id })
              .then((data) => {
                res.status(200).json({
                  msg: "Deadline Deleted Successfully",
                  data,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  msg: "Something went wrong",
                });
              });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

// ##### STATISTICS #########
const getStatistics = (req, res) => {
  const errorLog = [];

  // validate bearer token
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];

      jwt.verify(bearerToken, process.env.JWT_SECRET, async (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!authData.userId) {
            errorLog.push("user_id is required");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
            });
          } else {
            //get user spent budget

            DoStatistics(authData.userId).then(async () => {
              const user = await UserData.findOne({
                user_id: authData.userId,
              });

              const userStates = await statistics.find({
                user_id: authData.userId,
              });

              res.status(200).json({
                msg: "Statistics Fetched Successfully",
                data: {
                  spent_budget: user.spent,
                  statistics: userStates,
                },
              });
            });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

// ##### SHEETS #########
const addSheets = (req, res) => {
  const errorLog = [];
  const { sheet_type } = req.body;

  // validate bearer token
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!authData.userId) {
            errorLog.push("user_id is not valid");
          }

          if (!sheet_type) {
            errorLog.push("sheet_type is required");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            const newSheet = new Sheets({
              user_id: authData.userId,
              sheet_type,
              value: 0,
            });
            newSheet
              .save()
              .then(async (data) => {
                await SheetValue(data._id);
                await UpdateUserData(authData.userId);
                await CalcLimitValue(authData.userId);
                await DoStatistics(authData.userId);

                res.status(200).json({
                  msg: "Sheet Added Successfully",
                  data,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  msg: "Something went wrong",
                });
              });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

const getSheets = (req, res) => {
  const errorLog = [];

  //validate bearer token
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!authData.userId) {
            errorLog.push("user_id is required");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            Sheets.find({ user_id: authData.userId })
              .then((data) => {
                res.status(200).json({
                  msg: "Sheets Fetched Successfully",
                  data,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  msg: "Something went wrong",
                });
              });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

const deleteSheet = (req, res) => {
  const errorLog = [];
  const { sheet_id } = req.params;

  //validate bearer token
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, async (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!sheet_id) {
            errorLog.push("sheet_id is required");
          }

          //check if id passed in the params is valid for the mongo
          if (!mongoose.Types.ObjectId.isValid(sheet_id)) {
            errorLog.push("sheet_id is not valid");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            const response = await Sheets.findOneAndDelete({
              _id: sheet_id,
            });

            if (response === null) {
              res.status(404).json({
                msg: "Sheet already deleted",
              });
            } else if (response) {
              //delete all sheet expenses
              await Expenses.deleteMany({
                sheet_id,
              });

              try {
                await DoStatistics(authData.userId);
                await UpdateUserData(authData.userId);
                await CalcLimitValue(authData.userId);

                res.status(200).json({
                  msg: "Sheet Deleted Successfully",
                });
              } catch (err) {
                res.status(500).json({
                  msg: "Error deleting sheet: " + err.message,
                });
              }
            } else {
              res.status(500).json({
                msg: "Something went wrong",
              });
            }
          }
        }
      });
    } catch (error) {
      F;
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

const updateSheet = async (req, res) => {
  const errorLog = [];

  const { sheet_id } = req.params;
  const { sheet_type } = req.body;

  //validate bearer token
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, async (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!sheet_id) {
            errorLog.push("sheet_id is required");
          }

          //check if id passed in the params is valid for the mongo
          if (!mongoose.Types.ObjectId.isValid(sheet_id)) {
            errorLog.push("sheet_id is not valid");
          }

          if (!sheet_type) {
            errorLog.push("sheet_type is required");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            const response = await Sheets.findByIdAndUpdate(sheet_id, {
              sheet_type,
              updated_at: Date.now(),
            });
            if (response) {
              res.status(200).json({
                msg: "Sheet Updated Successfully",
              });
            } else {
              res.status(500).json({
                msg: "Something went wrong",
              });
            }
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

// ########## LABELS ###########
const addLabels = (req, res) => {
  const errorLog = [];
  const { label } = req.body;
  // label always in lowercase

  //validate bearer token
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!authData.userId) {
            errorLog.push("user_id is required");
          }
          if (!label) {
            errorLog.push("label is required");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            DoStatistics(authData.userId);
            const newLabel = new Labels({
              user_id: authData.userId,
              label: label.toLowerCase(),
            });
            // first check if this label found or not
            Labels.findOne({ user_id: authData.userId, label }).then((data) => {
              if (data) {
                res.status(409).json({
                  msg: "Label already exists",
                });
              } else {
                newLabel
                  .save()
                  .then((data) => {
                    res.status(200).json({
                      msg: "Label Added Successfully",
                      data,
                    });
                  })
                  .catch((err) => {
                    res.status(500).json({
                      msg: "Something went wrong",
                    });
                  });
              }
            });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

const getLabels = (req, res) => {
  const errorLog = [];

  //validate bearer token
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!authData.userId) {
            errorLog.push("user_id is required");
          }
          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            Labels.find({ user_id: authData.userId })
              .then((data) => {
                res.status(200).json({
                  msg: "Labels Fetched Successfullyy",
                  data,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  msg: "Something went wrong",
                });
              });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

const deleteLabel = (req, res) => {
  const errorLog = [];
  const { label_id } = req.params;

  //validate bearer token
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!label_id) {
            errorLog.push("label_id is required");
          }

          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            Labels.findByIdAndDelete(label_id)
              .then(async (data) => {
                await DoStatistics(authData.userId);
                await CalcLimitValue(authData.userId);

                res.status(200).json({
                  msg: "Label Deleted Successfully",
                  data,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  msg: "Something went wrong",
                });
              });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

// ######## USERDATA #########
const get_user_data = (req, res) => {
  const errorLog = [];

  //validate bearer token
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    try {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
          res.status(403).json({
            msg: "Forbidden",
          });
        } else {
          if (!authData.userId) {
            errorLog.push("user_id is required");
          }
          if (errorLog.length > 0) {
            res.status(400).json({
              msg: "Bad Request",
              errorLog,
            });
          } else {
            UserData.findOne({ user_id: authData.userId })
              .then((data) => {
                res.status(200).json({
                  msg: "User Data Fetched Successfully",
                  data,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  msg: "Something went wrong",
                });
              });
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Internal Server Error",
        error,
      });
    }
  }
};

module.exports = {
  get_user_data,
  addLabels,
  getLabels,
  deleteLabel,
  getSheets,
  addSheets,
  deleteSheet,
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
  addLimit,
  getLimits,
  updateLimit,
  deleteLimit,
};
