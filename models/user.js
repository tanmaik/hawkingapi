const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  first: { type: String, required: true },
  last: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true, minlength: 8 },
  avatar: { type: String, required: true },
  summaries: [
    { type: mongoose.Types.ObjectId, required: true, ref: "Summary" },
  ],
  goals: [{ type: String, required: false }],
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model("User", userSchema);
