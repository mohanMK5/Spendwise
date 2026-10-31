// WHAT: connects our app to MongoDB.
// WHY a separate file: App.js stays short, and the DB code lives in one place.
// This is the ONLY place we call mongoose.connect(). Every model file just
// imports mongoose; they all share this one connection automatically.
const mongoose = require("mongoose");

async function connectDB() {
  try {
    const mongoUri = process.env.database || process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
    await mongoose.connect(mongoUri);
    console.log("database connected");
  } catch (error) {
    console.log("unable to connect to the database");
    console.log(error.message);
    process.exit(1); // no database = no app, so stop the server
  }
}

module.exports = connectDB;
