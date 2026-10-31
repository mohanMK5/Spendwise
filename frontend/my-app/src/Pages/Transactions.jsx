import { useCallback, useEffect, useState } from "react";
import api from "../api";
import TransactionForm from "../components/TransactionForm";
import { formatMoney, formatDate, getErrorMessage } from "../utils/helpers";
import "./Transactions.css";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState(""); // "" = all
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // the transaction being edited
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // READ: get the list from the backend.
  // useCallback keeps the same function until typeFilter changes, so the
  // useEffect below only re-runs when the filter really changes.
  const fetchTransactions = useCallback(async () => {
    try {
      const params = typeFilter ? { type: typeFilter } : {}; // -> ?type=expense
      const res = await api.get("/transactions", { params });
      setTransactions(res.data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // CREATE or UPDATE: the form calls this with its data.
  // If we have an "editing" item it is an update (PUT), otherwise a create (POST).
  const handleSave = async (data) => {
    if (editing) {
      await api.put(`/transactions/${editing._id}`, data);
    } else {
      await api.post("/transactions", data);
    }
    closeForm();
    fetchTransactions(); // reload so the list shows the change
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const openAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (transaction) => {
    setEditing(transaction);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div>
      <div className="TxHeader">
        <h2 className="PageTitle">Transactions</h2>
        <div className="TxHeaderRight">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <button className="BtnPrimary" onClick={openAdd}>
            + Add
          </button>
        </div>
      </div>

      {error && <p className="PageError">{error}</p>}

      {/* key makes React create a NEW form when we switch between add and
          edit (or between two items), so the old typed values do not stay */}
      {showForm && (
        <TransactionForm
          key={editing ? editing._id : "new"}
          initial={editing}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}

      {loading ? (
        <p>Loading...</p>
      ) : transactions.length === 0 ? (
        <p className="Muted">No transactions found.</p>
      ) : (
        <div className="TableWrap">
          <table className="TxTable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th className="right">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {/* key must be unique for each row: we use the database _id */}
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td>{formatDate(t.date)}</td>
                  <td>{t.title}</td>
                  <td>{t.category}</td>
                  <td className={`right ${t.type}`}>
                    {t.type === "income" ? "+" : "-"}
                    {formatMoney(t.amount)}
                  </td>
                  <td className="right">
                    <button className="BtnGhost" onClick={() => openEdit(t)}>
                      Edit
                    </button>
                    <button
                      className="BtnDanger"
                      onClick={() => handleDelete(t._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Transactions;
