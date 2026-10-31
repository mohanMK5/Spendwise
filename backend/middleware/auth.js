// MIDDLEWARE = a function that runs BEFORE the controller.
// It can stop the request (send an error) or let it continue with next().
//
// This one is the "security guard": it checks the JWT token.
// If the token is good, it attaches the user to req.user and calls next().
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  // The frontend sends:  Authorization: Bearer <token>
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const token = header.split(" ")[1]; // "Bearer abc" -> "abc"

  try {
    // verify() checks the signature and the expiry. It throws if bad.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // The token only holds the user's id, so we load the user from the DB.
    // .select("-password") means: give me everything EXCEPT the password.
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user; // every controller after this can use req.user
    next(); // pass the request on to the next function
  } catch (error) {
    return res.status(401).json({ message: "Token is invalid or expired" });
  }
}

module.exports = protect;
