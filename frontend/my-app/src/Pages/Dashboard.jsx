import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { formatMoney, formatDate, getErrorMessage } from "../utils/helpers";
import "./Dashboard.css";

function Dashboard() {
  const [summary, setSummary] = useState(null); // totals from the backend
  const [recent, setRecent] = useState([]); // last 5 transactions
  const [error, setError] = useState("");

  // useEffect with [] = run once, right after the page first appears.
  // This is the standard place to fetch data.
  useEffect(() => {
    async function loadData() {
      try {
        // Two requests at the same time (faster than one after another)
        const [summaryRes, recentRes] = await Promise.all([
          api.get("/transactions/summary"),
          api.get("/transactions", { params: { limit: 5 } }), // -> ?limit=5
        ]);
        setSummary(summaryRes.data);
        setRecent(recentRes.data);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
    loadData();
  }, []);

  if (error) return <p className="PageError">{error}</p>;
  if (!summary) return <p>Loading...</p>; // data has not arrived yet

  // The longest bar = the biggest category. The others are a % of it.
  const biggest = summary.byCategory.length ? summary.byCategory[0].total : 1;

  return (
    <div>
      <h2 className="PageTitle">Dashboard</h2>

      <div className="SummaryCards">
        <div className="SummaryCard">
          <span>Income</span>
          <strong className="income">{formatMoney(summary.totalIncome)}</strong>
        </div>
        <div className="SummaryCard">
          <span>Expense</span>
          <strong className="expense">{formatMoney(summary.totalExpense)}</strong>
        </div>
        <div className="SummaryCard">
          <span>Balance</span>
          <strong>{formatMoney(summary.balance)}</strong>
        </div>
      </div>

      <div className="DashboardGrid">
        <section className="Panel">
          <h3>Spending by category</h3>
          {summary.byCategory.length === 0 && (
            <p className="Muted">No expenses yet.</p>
          )}
          {summary.byCategory.map((item) => (
            <div className="BarRow" key={item.category}>
              <div className="BarLabel">
                <span>{item.category}</span>
                <span>{formatMoney(item.total)}</span>
              </div>
              <div className="BarTrack">
                {/* width is a % of the biggest category */}
                <div
                  className="BarFill"
                  style={{ width: `${(item.total / biggest) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </section>

        <section className="Panel">
          <h3>Recent transactions</h3>
          {recent.length === 0 && (
            <p className="Muted">
              Nothing here yet. <Link to="/transactions">Add your first one</Link>
            </p>
          )}
          {recent.map((t) => (
            <div className="RecentRow" key={t._id}>
              <div>
                <div>{t.title}</div>
                <small className="Muted">
                  {t.category} · {formatDate(t.date)}
                </small>
              </div>
              <strong className={t.type}>
                {t.type === "income" ? "+" : "-"}
                {formatMoney(t.amount)}
              </strong>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
