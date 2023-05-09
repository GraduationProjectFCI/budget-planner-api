const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String },
  gender:{ type:String },
  budget: { type:Number },
  currency: { type:String },
  birthdate: { type:Date },
  account_age: { type:Date },
  active: { type: Boolean },
});

UserSchema.pre("save", async function () {
  //hash password
  //generate a random byte genSalt("number of rounds")=>how many rondom bytes to generate
  //the bigger the number the more secure the password
  //but the more rounds you have the more processing power is going require
  //so you have to find a balance between security and performance
  //the default is 10 rounds
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
};

UserSchema.methods.comparePassword = async function (candidatePasword) {
  const isMatch = await bcrypt.compare(candidatePasword, this.password);
  return isMatch;
};
module.exports = mongoose.model("User", UserSchema);