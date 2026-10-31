// MODEL = the blueprint of one document in the "users" collection.
// Schema = the fields + the rules for each field.
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // removes spaces at the start and end
  },
  email: {
    type: String,
    required: true,
    unique: true, // MongoDB refuses a second user with the same email
    lowercase: true, // "A@x.com" and "a@x.com" are the same person
    trim: true,
  },
  password: {
    type: String,
    required: true, // this will store the HASH, never the real password
  },
});

// "User" -> Mongoose creates the collection called "users" for us
module.exports = mongoose.model("User", userSchema);
