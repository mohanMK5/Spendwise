// One income or expense entry.
// The important field is "user": it stores WHO owns this transaction.
// Every query later filters by this field, so users only see their own data.
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // the _id of a User document
      ref: "User", // tells Mongoose which model this id points to
      required: true,
    },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    type: {
      type: String,
      enum: ["income", "expense"], // only these two values are allowed
      required: true,
    },
    category: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true } // Mongoose adds createdAt and updatedAt for free
);

module.exports = mongoose.model("Transaction", transactionSchema);
