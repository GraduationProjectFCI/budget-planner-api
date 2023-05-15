const mongoose = require("mongoose");

CodeSchema = new mongoose.Schema({
  email: String,
  user_id: mongoose.Types.ObjectId,
  code: Number,
  used: { type: Boolean, default: false },
  createdAt: Date,
});

CodeSchema.methods.compareCode = async function (candidateCode) {
  if (candidateCode == this.code) {
    return true;
  } else {
    return false;
  }
};

module.exports = mongoose.model("Code", CodeSchema);
