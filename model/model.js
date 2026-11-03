const mongoose = require("mongoose");
const memberSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  age: {
    required: [true, "A kor megadása kötelező!"],
    type: Number,
  },
});

module.exports = mongoose.model("Member", memberSchema, "members");
