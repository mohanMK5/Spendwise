const express = require("express");
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
} = require("../controllers/transactionController");
const protect = require("../middleware/auth");

const router = express.Router();

// router.use(protect) = the guard runs before EVERY route below.
// So nobody can touch transactions without a valid token.
router.use(protect);

// ORDER MATTERS: "/summary" must come before "/:id".
// Otherwise Express would treat the word "summary" as an id.
router.get("/summary", getSummary);

router.get("/", getTransactions);
router.post("/", createTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

module.exports = router;
