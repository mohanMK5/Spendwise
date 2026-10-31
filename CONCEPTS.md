# SpendWise - Concepts Guide

Each concept: what it is, why we need it, and WHERE to see it in this project.
At the end there are interview questions.

---

## PART 1 - BACKEND

### 1. Client and server
The browser (React) is the **client**. Node + Express is the **server**.
They talk using **HTTP requests** and the server answers with **JSON**.
A request has a **method** (GET read, POST create, PUT update, DELETE remove),
a **URL**, and sometimes a **body** (the data).

### 2. Express and the request flow
`App.js`. Express receives a request and runs functions one after another:
`cors()` -> `express.json()` -> router -> middleware -> controller -> response.

### 3. Middleware
A function with `(req, res, next)` that runs before the controller.
It can stop the request (`res.status(401)...`) or continue with `next()`.
- `express.json()`: turns the JSON body into `req.body`.
- `cors()`: allows the React app (port 3000) to call the server (port 5000).
  Browsers block this by default for safety.
- `protect` (`middleware/auth.js`): the login guard.

### 4. Routes vs controllers
- **Route** = which URL + method runs which function (`routes/`).
- **Controller** = the function that does the work (`controllers/`).
- `app.use("/api/auth", authRoutes)` gives the first part of the URL;
  `router.post("/register", ...)` gives the last part.
Splitting them keeps each file short and each job clear (this is called
"separation of concerns").

### 5. Route order
In `transactionRoutes.js`, `/summary` is placed before `/:id`. Express checks
routes top to bottom, and `/:id` would swallow the word "summary".

### 6. MongoDB and Mongoose
MongoDB stores **documents** (like JSON objects) inside **collections**
(like tables). Mongoose gives us:
- **Schema**: the fields and rules (`required`, `unique`, `enum`, `min`).
- **Model**: the tool to use the schema (`User.find`, `User.create` ...).
`mongoose.connect()` is called once in `config/db.js`. Model files only
`require("mongoose")`; they share that one connection.

### 7. CRUD in Mongoose
| Action | Method | Where |
|---|---|---|
| Create | `Transaction.create(...)` | createTransaction |
| Read | `Transaction.find(filter)` | getTransactions |
| Update | `Transaction.findOneAndUpdate(...)` | updateTransaction |
| Delete | `Transaction.findOneAndDelete(...)` | deleteTransaction |

### 8. async / await and try / catch
Database work takes time, so these functions are `async` and we `await` them.
`try { ... } catch (error) { ... }` lets us send a clean error reply instead of crashing.

### 9. Status codes (know these)
200 OK, 201 Created, 400 Bad request (user's mistake), 401 Not logged in /
bad token, 403 Not allowed, 404 Not found, 500 Server error.

### 10. Password hashing (bcrypt)
Never store real passwords. `bcrypt.hash(password, 10)` makes a one-way hash.
At login, `bcrypt.compare(typed, storedHash)` checks it. The `10` is the
"salt rounds": higher = slower for attackers, and for you.
Note: we check the password length BEFORE hashing, because every hash is 60
characters long.

### 11. JWT (JSON Web Token)
After login the server creates a signed token holding the user's id
(`jwt.sign`). The browser sends it back on every request, and
`jwt.verify` proves it is real and not expired. HTTP has no memory, so the
token is how the server knows "this request is from user X".
The secret in `.env` (`JWT_SECRET`) is what makes the signature impossible to fake.

### 12. Authentication, authorization, ownership
- **Authentication**: who are you? (login + token)
- **Authorization**: are you allowed to do this? (the guard)
- **Ownership**: is this record yours? Every transaction stores `user`,
  and every query includes `{ user: req.user._id }`.
Without the ownership filter, a logged-in user could read someone else's data.

### 13. Never trust the client
- The owner of a new transaction comes from the TOKEN (`req.user._id`), not
  from `req.body`.
- We pick the fields one by one (`title, amount, ...`) instead of saving the
  whole `req.body`.
- The frontend also validates, but the backend validates again, because anyone
  can call the API without your frontend.

### 14. Aggregation
`getSummary` uses a pipeline: `$match` (filter) then `$group` with `$sum`
(add up). Same idea as `SELECT type, SUM(amount) ... GROUP BY type` in SQL.
MongoDB does the maths, so we do not download every transaction to add them.

### 15. Environment variables (.env)
Secrets and settings (database URL, JWT secret, port) live in `.env`, are read
with `process.env.NAME`, and `.env` is in `.gitignore` so it never goes to
GitHub. `.env.example` shows the names without the secrets.

---

## PART 2 - FRONTEND

### 16. Components and JSX
A component is a function that returns JSX (HTML-like code). Each page here is one.

### 17. State (`useState`)
Data that, when changed, makes React redraw the screen.
`const [form, setForm] = useState({...})`. Never change state directly; always
use the setter.

### 18. Controlled inputs
`value={form.email}` + `onChange={handleChange}`. React is the single source of
truth for what is typed. One `handleChange` serves all inputs by using the
input's `name`: `[e.target.name]: e.target.value`.

### 19. Forms
`onSubmit` + `e.preventDefault()` stops the browser from reloading the page.

### 20. `useEffect`
Runs code after the screen is drawn. `useEffect(() => {...}, [])` = once, when
the page opens. This is where we fetch data (Dashboard).
With `[typeFilter]` it runs again whenever the filter changes (Transactions).

### 21. Props
Inputs passed from a parent to a child component:
`<TransactionForm initial={editing} onSave={handleSave} onCancel={closeForm} />`.
Data flows down; functions are passed down so the child can tell the parent
something happened.

### 22. Lists and `key`
`transactions.map(t => <tr key={t._id}>...)`. `key` must be unique so React can
track each row. We also use `key` on `<TransactionForm>` to reset it when we
switch between add and edit.

### 23. Conditional rendering
`{error && <p>{error}</p>}` and `loading ? ... : ...`. The screen is a
function of the state.

### 24. React Router
`BrowserRouter` (index.js) enables routing. `Routes` / `Route` (App.js) map
URLs to pages. `NavLink` / `Link` change the page without reloading.
`useNavigate` changes it from code. `Outlet` is the hole in `Layout` where
the current page appears. `Navigate` redirects.

### 25. Context API
`AuthContext` stores `user` and the functions `login`, `register`, `logout`.
Any component reads them with `useAuth()`. Without Context we would have to
pass `user` through every component by hand ("prop drilling").

### 26. Protected routes
`ProtectedRoute` checks `user`. No user -> redirect to /login.
IMPORTANT: this only improves the experience. The real protection is the
backend `protect` middleware, because a user can change anything in their browser.

### 27. Staying logged in after refresh
React state is erased on refresh, but `localStorage` is not. On startup,
`AuthContext` reads the token and calls `GET /auth/me` to get the user back.
The `loading` state stops a flash of the login page while this happens.

### 28. axios, instance and interceptor
`api.js` creates one axios instance with the base URL. The **interceptor**
adds `Authorization: Bearer <token>` to every request automatically.
Error replies appear in `err.response.data.message`.

### 29. Environment variables in CRA
Must start with `REACT_APP_` and are read with `process.env.REACT_APP_...`.
(In Vite it will be `VITE_` and `import.meta.env`.)
They are visible in the browser, so never put secrets in them.

---

## INTERVIEW QUESTIONS (with short answers)

1. **What is the difference between authentication and authorization?**
   Authentication proves who you are (login). Authorization decides what you may do.

2. **Why do we hash passwords? Why not encrypt?**
   Hashing is one-way, so even we cannot read the password. Encryption can be reversed.

3. **How does JWT work?**
   Server signs a token with a secret after login. Client sends it on each request.
   Server verifies the signature and expiry, so it needs no session memory.

4. **Where do you store the token? Any risk?**
   Here: localStorage (simple). Risk: JavaScript on the page can read it (XSS).
   httpOnly cookies are safer. This is a good thing to mention.

5. **What is middleware?**
   A function between the request and the controller, with `next()`. Examples: cors, express.json, protect.

6. **Why is `/summary` before `/:id`?**
   Express matches in order; `/:id` would take "summary" as an id.

7. **How do you make sure a user cannot see another user's data?**
   Each document stores its owner, and every query filters by `req.user._id`.
   The owner id comes from the token, not the request body.

8. **401 vs 403?**
   401 = not logged in or bad token. 403 = logged in but not allowed.

9. **Why validate on both frontend and backend?**
   Frontend = fast feedback. Backend = real safety, since the API can be called without the frontend.

10. **What is `useEffect` and what does `[]` do?**
    Runs side effects (like fetching) after render. `[]` = only once.

11. **Why `key` in lists?**
    Lets React identify items, so it updates only what changed.

12. **Controlled vs uncontrolled input?**
    Controlled: React state holds the value (`value` + `onChange`). Uncontrolled: the DOM holds it.

13. **What is CORS?**
    A browser rule that blocks calls to another origin (domain + port) unless the server allows it. `cors()` allows it.

14. **What is Context and when would you use it?**
    Shared data for many components (logged-in user, theme) without prop drilling.

15. **What is an aggregation pipeline?**
    Steps ($match, $group, $sort) that MongoDB runs to calculate results, like SQL GROUP BY.

16. **What is the difference between PUT and POST?**
    POST creates; PUT updates an existing resource.

17. **Why is `.env` in `.gitignore`?**
    It holds secrets. If pushed to GitHub, anyone can use your database.

18. **What is `Outlet` for in React Router?**
    It marks where child routes render inside a layout, so the navbar is written once.
