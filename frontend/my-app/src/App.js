// All the frontend routes live here.
// Think of this file as the "map" of the website.
import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./Pages/Dashboard";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Transactions from "./Pages/Transactions";

function App() {
  return (
    <Routes>
      {/* Public pages: anyone can open these */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Private pages: ProtectedRoute checks the login first.
          Then Layout draws the navbar, and the page appears in its <Outlet /> */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
