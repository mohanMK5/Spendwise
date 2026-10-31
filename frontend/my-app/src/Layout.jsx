import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./Layout.css";

// The frame around every private page: navbar on top, page below.
function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout(); // clears the token and the user
    navigate("/login");
  };

  return (
    <div className="layout">
      <header className="container">
        <div className="navbar">
          <h1 className="appName">SpendWise</h1>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/transactions">Transactions</NavLink>
        </div>
        <div className="userName">
          <h2>Hi, {user.name}</h2>
          <button onClick={handleLogout}>LogOut</button>
        </div>
      </header>

      <main className="content">
        {/* The current page (Dashboard or Transactions) is drawn here */}
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
