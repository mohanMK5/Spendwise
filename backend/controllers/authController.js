// CONTROLLER = the logic. A route says "run this function", and the function
// reads the request (req), does the work, and sends a reply (res).
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Makes a token that holds the user's id. It expires in 7 days.
function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // 1. Check the input. We check the password length HERE, before hashing,
    //    because after hashing it is always 60 characters long.
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // 2. Is the email already used?
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 3. Hash the password. 10 = how much work bcrypt does (the "salt rounds").
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save the user with the HASH, not the real password.
    const user = await User.create({ name, email, password: hashedPassword });

    // 5. Reply with a token, so the user is logged in straight away.
    //    We never send the password back, not even the hash.
    res.status(201).json({
      token: createToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    // 1. Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // 2. Compare the typed password with the stored hash.
    //    We give the SAME message for "no user" and "wrong password", so an
    //    attacker cannot find out which emails are registered.
    const passwordMatches = user && (await bcrypt.compare(password, user.password));
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Correct, so give a new token
    res.json({
      token: createToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/auth/me  (protected)
// The frontend calls this when the page is refreshed, to ask:
// "I have a token. Who am I?"  protect() already put the user in req.user.
function me(req, res) {
  res.json({
    user: { id: req.user._id, name: req.user.name, email: req.user.email },
  });
}

module.exports = { register, login, me };
