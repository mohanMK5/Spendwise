# SpendWise - MERN Expense Tracker

A complete beginner-friendly MERN app: register, login, add / edit / delete
transactions, and a dashboard with totals. Every file has comments that explain
WHAT it does and WHY.

Read in this order: this README (run it + see the map), then `CONCEPTS.md`.

---

## 1. Run it

You need two terminals.

**Backend**
```
cd backend
npm install
```
Create a file called `.env` inside `backend` (copy `.env.example`):
```
Port=5000
database=<your MongoDB connection string>
JWT_SECRET=any_long_random_text
```
Then:
```
npm start
```
You should see: `database connected` and `the app is listening at 5000`.

**Frontend**
```
cd frontend/my-app
npm install
npm start
```
Open http://localhost:3000

---

## 2. The map: which file does what

```
backend/
  App.js                       starts the server, plugs everything together
  config/db.js                 connects to MongoDB (the ONLY place that connects)
  models/User.js               what a user looks like
  models/Transaction.js        what a transaction looks like (has an owner: "user")
  middleware/auth.js           the guard: checks the token before protected routes
  controllers/authController.js          register, login, me
  controllers/transactionController.js   get, create, update, delete, summary
  routes/authRoutes.js         URL -> function (auth)
  routes/transactionRoutes.js  URL -> function (transactions)

frontend/my-app/src/
  index.js                     starts React, adds Router + AuthProvider
  App.js                       the page map (routes)
  api.js                       axios setup + adds the token to every request
  context/AuthContext.jsx      "who is logged in" shared by all components
  components/ProtectedRoute.jsx   sends logged-out users to /login
  components/TransactionForm.jsx  add / edit form
  Layout.jsx                   navbar + the current page
  Pages/Login.jsx, Register.jsx, Dashboard.jsx, Transactions.jsx
  utils/helpers.js             error message, money and date formatting
```

---

## 3. The API (backend)

| Method | URL | Login needed | What it does |
|---|---|---|---|
| POST | /api/auth/register | no | create user, return token |
| POST | /api/auth/login | no | check password, return token |
| GET | /api/auth/me | yes | who owns this token? |
| GET | /api/transactions | yes | my transactions (`?type=`, `?category=`, `?limit=`) |
| POST | /api/transactions | yes | add one |
| PUT | /api/transactions/:id | yes | edit one (only if it is mine) |
| DELETE | /api/transactions/:id | yes | delete one (only if it is mine) |
| GET | /api/transactions/summary | yes | totals + spending by category |

---

## 4. Follow one request all the way (add a transaction)

```
You click "Save" in TransactionForm.jsx
  -> handleSubmit calls onSave(data)                       (TransactionForm.jsx)
  -> Transactions.jsx handleSave calls api.post(...)       (Transactions.jsx)
  -> api.js interceptor adds  Authorization: Bearer <token>
  -> request travels to the backend:  POST /api/transactions
  -> App.js: cors() and express.json() run (body becomes req.body)
  -> App.js sends /api/transactions to transactionRoutes.js
  -> router.use(protect): middleware/auth.js checks the token, sets req.user
  -> router.post("/") runs createTransaction                (transactionController.js)
  -> Transaction.create({ user: req.user._id, ... }) saves it in MongoDB
  -> backend replies 201 + the new transaction
  -> Transactions.jsx calls fetchTransactions() -> the table refreshes
```
If you understand this chain, you understand the whole app.

---

## 5. Things I fixed in your original files

1. `package.json` had `moongose` (a different, wrong package) and did not have
   `mongoose`. Now it has `mongoose`. If you keep your own package.json run:
   `npm uninstall moongose` then `npm install mongoose`.
2. `App.js` had `import Module from 'module'`, added automatically by VS Code.
   It breaks a `require()` project, so it is removed.
3. `new ({email,password,name})` had no model name. It must be `new User(...)`.
   Now handled properly in `authController.js`.
4. The register route was written inside `App.js`. It is now split into
   routes + controller, so each file has one job.
5. Frontend: `Layout.jsx` now shows the real user name, and the old `/Dashboard` duplicate route is removed (the dashboard is the index page `/`).
6. Your `.env` keys `Port` and `database` are kept. Only `JWT_SECRET` is new.

Your own design (teal colours, CSS class names, Layout, Login, Register) is kept.

---

## 6. Try these to check everything works

- Open /transactions while logged out -> you are sent to /login.
- Register -> you land on the dashboard and see your name.
- Register the same email again -> "Email already registered".
- Add one income and two expenses -> dashboard totals and bars update.
- Edit and delete a transaction.
- Refresh the page -> you stay logged in.
- Log out, then register a second user -> they see NO data from the first user.
- Open MongoDB and look at the `users` collection: the password is a long
  scrambled hash, never the real password.

---

## 7. Next ideas (build these yourself)

- Filter transactions by category and by month.
- Show a message ("Saved!") after adding.
- Add a "Change password" page.
- Move the frontend to Vite in your next project.
- Deploy: backend on Render, frontend on Vercel, database on MongoDB Atlas.
  Set the env variables in the host's dashboard, never upload `.env`.
