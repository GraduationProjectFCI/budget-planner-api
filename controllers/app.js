const UserData = require("../models/user_data_modal");
const Labels = require("../models/LabelSchema");
const Sheets = require("../models/sheetSchema");
const Statistics = require("../models/statesSchema");
const Deadlines = require("../models/deadlineSchema");

const jwt = require("jsonwebtoken");

// ######## DEADLINES ##########
const addDeadline = (req, res) => {
  const errorLog = [];
  const { deadline_name, deadline_date, deadline_value } = req.body;

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
          Statistics.find({ user_id: authData.userId })
            .then((data) => {
              res.status(200).json({
                msg: "Statistics Fetched Successfully",
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

const addStatistics = (req, res) => {
  const errorLog = [];
  const { label_name, value } = req.body;

  // validate bearer tokenn
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

        if (!label_name) {
          errorLog.push("label_name is required");
        }
        if (!value) {
          errorLog.push("value is required");
        }

        if (errorLog.length > 0) {
          res.status(400).json({
            msg: "Bad Request",
            errorLog,
          });
        } else {
          const newStatistics = new Statistics({
            user_id: authData.userId,
            label_name,
            value,
          });
          newStatistics
            .save()
            .then((data) => {
              res.status(200).json({
                msg: "Statistics Added Successfully",
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
          const newSheet = new Sheets({
            user_id: authData.userId,
            sheet_type,
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
          const newLabel = new Labels({
            user_id: authData.userId,
            label,
          });
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
                msg: "Labels Fetched Successfully",
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
const update_user_data = async (req, res) => {
  const errorLog = [];

  const { spent, total } = req.body;

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
        if (!authData.userId) {
          errorLog.push("user_id is required");
        }
        if (!spent) {
          errorLog.push("spent is required");
        }

        if (!total) {
          errorLog.push("total is required");
        }

        if (errorLog.length > 0) {
          res.status(400).json({
            msg: "Bad Request",
            errorLog,
          });
        } else {
          const response = await UserData.findOneAndUpdate(
            { user_id: authData.userId },
            {
              spent,
              remaining: total - spent,
              total,
              updated_at: Date.now(),
            }
          );

          if (response) {
            res.status(200).json({
              msg: "User Data Updated Successfully",
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
          UserData.find({ user_id: authData.userId })
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
};
