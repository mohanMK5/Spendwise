// All the transaction logic. Notice that EVERY query contains
// { user: req.user._id }. That one line is what keeps each user's data private.
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

// GET /api/transactions?type=expense&category=Food&limit=5
async function getTransactions(req, res) {
  try {
    const filter = { user: req.user._id }; // always only MY data

    // Optional filters come from the URL query string (?type=...)
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;

    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 }) // newest first
      .limit(Number(req.query.limit) || 0); // limit(0) means "no limit"

    res.json(transactions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/transactions
async function createTransaction(req, res) {
  try {
    // Pick the fields ourselves. Never pass the whole req.body to the DB,
    // or the user could send a different "user" id and write into someone else's data.
    const { title, amount, type, category, date } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id, // the owner comes from the TOKEN, not from the body
      title,
      amount,
      type,
      category,
      date,
    });

    res.status(201).json(transaction);
  } catch (error) {
    // ValidationError = a schema rule failed (missing title, bad type...)
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

// PUT /api/transactions/:id
async function updateTransaction(req, res) {
  try {
    const { id } = req.params; // the :id part of the URL

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const { title, amount, type, category, date } = req.body;

    // Find by id AND owner. If it is somebody else's transaction, we get null.
    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { title, amount, type, category, date },
      { new: true, runValidators: true } // new: return the updated version
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json(transaction);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/transactions/:id
async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      user: req.user._id, // ownership check again
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json({ message: "Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/transactions/summary
// Totals for the dashboard, calculated by MongoDB itself (aggregation).
async function getSummary(req, res) {
  try {
    // aggregate() does NOT auto-convert strings to ObjectId like find() does,
    // so we convert req.user._id ourselves.
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Pipeline = steps, one after another:
    // $match = keep only my documents      (like a filter)
    // $group = bucket them and add up      (like GROUP BY in SQL)

    // Step A: total income and total expense
    const totals = await Transaction.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    // Step B: expense total for each category
    const byCategory = await Transaction.aggregate([
      { $match: { user: userId, type: "expense" } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } }, // biggest first
    ]);

    // Turn [{_id:"income",total:500},{_id:"expense",total:200}] into numbers
    let totalIncome = 0;
    let totalExpense = 0;
    totals.forEach((item) => {
      if (item._id === "income") totalIncome = item.total;
      if (item._id === "expense") totalExpense = item.total;
    });

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      byCategory: byCategory.map((c) => ({ category: c._id, total: c.total })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
};
