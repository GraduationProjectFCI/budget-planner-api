const UserData = require("../models/user_data_modal");
const Labels = require("../models/LabelSchema");
const Sheets = require("../models/sheetSchema");
const Deadlines = require("../models/deadlineSchema");
const Expenses = require("../models/expenses");
const User = require("../models/user");
const statistics = require("../models/statesSchema");
const SheetValue = require("./SheetValue");

const Do_Statistics = require("./statistics");

const jwt = require("jsonwebtoken");

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
  }
};

const updateProfileData = (req, res) => {
  const errorLog = [];
  // validate bearer token in the request headers
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
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
          const { name, gender, budget, currnecy, birthdate } = req.body;
          const userData = await User.findOneAndUpdate(
            {
              _id: authData.userId,
            },
            {
              name,
              gender,
              budget,
              currnecy,
              birthdate,
            },
            {
              new: true,
            }
          );
          res.status(200).json({
            msg: "updated Successfully",
            userData,
          });
        }
      }
    });
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

        if (!value) {
          errorLog.push("value is required");
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
          const userLabels = [];

          //get user labels
          const labels = await Labels.find({ user_id: authData.userId });
          labels.map((label) => {
            userLabels.push(label.label);
          });

          //check if label is in user labels
          if (!userLabels.includes(label)) {
            res.status(400).json({
              msg: "Label does not exist",
            });
          } else {
            const newExpense = new Expenses({
              sheet_id,
              value,
              label,
              description,
            });
            newExpense
              .save()
              .then(async (data) => {
                Do_Statistics(authData.userId);
                SheetValue(sheet_id);
                const user_data = await UserData.findOne({
                  user_id: authData.userId,
                });

                const spent_budget = user_data.spent + value;
                const remaining_budget = user_data.total - spent_budget;

                await UserData.findOneAndUpdate(
                  {
                    user_id: authData.userId,
                  },
                  {
                    spent: spent_budget,
                    remaining: remaining_budget,
                  }
                );

                res.status(200).json({
                  msg: "Expense Added Successfully",
                  data,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  msg: "Internal Server Error",
                  err,
                });
              });
          }
        }
      }
    });
  }
};

const getExpenses = (req, res) => {
  const errorLog = [];
  const { label } = req.body;
  // validate bearer token in the request headers
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
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
        if (label) {
          Expenses.find({ user_id: authData.userId, label })
            .then((data) => {
              res.status(200).json({
                msg: "Expenses Fetched Successfully",
                data,
              });
            })
            .catch((err) => {
              res.status(500).json({
                msg: "Internal Server Error",
                err,
              });
            });
        } else {
          Expenses.find({ user_id: authData.userId })
            .then((data) => {
              res.status(200).json({
                msg: "Expenses Fetched Successfully",
                data,
              });
            })
            .catch((err) => {
              res.status(500).json({
                msg: "Internal Server Error",
                err,
              });
            });
        }
      }
    });
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
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, process.env.JWT_SECRET, async (err, authData) => {
      if (err) {
        res.status(403).json({
          msg: "Forbidden",
        });
      } else {
        if (!expense_id) {
          errorLog.push("expense_id is required");
        }
        if (errorLog.length > 0) {
          res.status(400).json({
            msg: "Bad Request",
            errorLog,
          });
        } else {
          const user_data = await UserData.findOne({
            user_id: authData.userId,
          });

          const expense = await Expenses.findOne({
            _id: expense_id,
          });
          if (!expense) {
            res.status(400).json({
              msg: "Expense does not exist",
            });
          } else {
            const spent_budget = user_data.spent - expense.value;
            const remaining_budget = user_data.total - spent_budget;

            // update userData
            await UserData.findOneAndUpdate(
              {
                user_id: authData.userId,
              },
              {
                spent: spent_budget,
                remaining: remaining_budget,
              }
            );

            // delete expense
            await expense
              .deleteOne({
                _id: expense_id,
              })
              .then(() => {
                Do_Statistics(authData.userId);
                SheetValue(sheet_id);
                res.status(200).json({
                  msg: "Expense Deleted Successfully",
                });
              });
          }
        }
      }
    });
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
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, process.env.JWT_SECRET, async (err, authData) => {
      if (err) {
        res.status(403).json({
          msg: "Forbidden",
        });
      } else {
        if (!expense_id) {
          errorLog.push("expense_id is required");
        }
        if (!value) {
          errorLog.push("value is required");
        }
        if (!label) {
          errorLog.push("label is required");
        }
        if (!description) {
          errorLog.push("description is required");
        }
        if (errorLog.length > 0) {
          res.status(400).json({
            msg: "Bad Request",
            errorLog,
          });
        } else {
          const user_data = await UserData.findOne({
            user_id: authData.userId,
          });

          const expense = await Expenses.findOne({ _id: expense_id });

          await expense
            .updateOne({
              value,
              label,
              description,
            })
            .then(async (data) => {
              Do_Statistics(authData.userId);
              SheetValue(sheet_id);

              const spent_budget = user_data.spent + (value - expense.value);
              const remaining_budget = user_data.total - spent_budget;
              await UserData.findOneAndUpdate(
                {
                  user_id: authData.userId,
                },
                {
                  spent: spent_budget,
                  remaining: remaining_budget,
                }
              );

              res.status(200).json({
                msg: "Expense Updated Successfully",
              });
            })
            .catch((err) => {
              res.status(500).json({
                msg: "Internal Server Error",
                err,
              });
            });
        }
      }
    });
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
          //get user spent budget
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
        }
      }
    });
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
          Do_Statistics(authData.userId);
          const newSheet = new Sheets({
            user_id: authData.userId,
            sheet_type,
            value: 0,
          });
          newSheet
            .save()
            .then((data) => {
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
  }
};

const deleteSheets = (req, res) => {
  const errorLog = [];
  const { sheet_id } = req.params;

  //validate bearer token
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
      if (err) {
        res.status(403).json({
          msg: "Forbidden",
        });
      } else {
        if (!sheet_id) {
          errorLog.push("sheet_id is required");
        }

        if (errorLog.length > 0) {
          res.status(400).json({
            msg: "Bad Request",
            errorLog,
          });
        } else {
          Sheets.findByIdAndDelete(sheet_id)
            .then((data) => {
              res.status(200).json({
                msg: "Sheet Deleted Successfully",
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
  }
};

// ########## LABELS ###########
const addLabels = (req, res) => {
  const errorLog = [];
  const { label } = req.body;
  // label always in lowercase
  const label_name = label.toLowerCase();

  //validate bearer token
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
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
          Do_Statistics(authData.userId);
          const newLabel = new Labels({
            user_id: authData.userId,
            label: label_name,
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
  }
};

const deleteLabels = (req, res) => {
  const errorLog = [];
  const { label_id } = req.params;

  //validate bearer token
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    res.status(401).json({
      msg: "Unauthorized",
    });
  } else {
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
            .then((data) => {
              Do_Statistics(authData.userId);
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
  }
};

module.exports = {
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
};