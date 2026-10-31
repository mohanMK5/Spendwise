// The main file. It does only four things:
// 1) load .env   2) set up middleware   3) plug in the routes   4) start the server
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load .env FIRST, before any file that reads process.env
dotenv.config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

// MIDDLEWARE (runs on every request, in this order)
app.use(cors()); // lets the React app (port 3000) call this server (port 5000)
app.use(express.json()); // reads the JSON body and puts it in req.body

// ROUTES: any URL starting with /api/auth goes to authRoutes, and so on
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

// A simple check that the server is alive
app.get("/", (req, res) => res.send("SpendWise API is running"));

// Connect to the database, then start listening
const port = process.env.Port || 5000;
connectDB().then(() => {
  app.listen(port, () => console.log(`the app is listening at ${port}`));
});
