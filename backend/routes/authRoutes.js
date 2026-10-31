// ROUTES = a list of "URL + method -> which function runs".
// The full URL is: (prefix set in App.js) + (path written here)
const express = require("express");
const { register, login, me } = require("../controllers/authController");
const protect = require("../middleware/auth");

const router = express.Router();

router.post("/register", register); // POST /api/auth/register
router.post("/login", login); // POST /api/auth/login
router.get("/me", protect, me); // GET  /api/auth/me   (guard runs first)

module.exports = router;
