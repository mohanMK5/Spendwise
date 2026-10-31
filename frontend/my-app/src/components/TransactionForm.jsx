// The add / edit form. It is a separate component so the Transactions page
// stays short. The parent gives it three PROPS (inputs):
//   initial  -> the transaction to edit, or null when adding a new one
//   onSave   -> a function to call with the form data
//   onCancel -> a function to call when the user closes the form
import { useState } from "react";
import { getErrorMessage } from "../utils/helpers";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Salary", "Other"];

function TransactionForm({ initial, onSave, onCancel }) {
  // If we are editing, start with the old values. Otherwise start empty.
  const [form, setForm] = useState({
    title: initial?.title || "",
    amount: initial?.amount ?? "",
    type: initial?.type || "expense",
    category: initial?.category || "Food",
    // <input type="date"> needs "YYYY-MM-DD", so we cut the time part off
    date: initial?.date
      ? initial.date.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setSaving(true);
      // Inputs always give text, so convert the amount to a number
      await onSave({ ...form, amount: Number(form.amount) });
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false); // on success the form closes, so no need to reset
    }
  };

  return (
    <form className="TxForm" onSubmit={handleSubmit}>
      <h3>{initial ? "Edit transaction" : "Add transaction"}</h3>

      {error && <p className="PageError">{error}</p>}

      <div className="TxFormGrid">
        <label>
          Title
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Lunch"
            required
          />
        </label>

        <label>
          Amount
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Type
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>

        <label>
          Category
          <select name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <div className="TxFormButtons">
        <button type="submit" className="BtnPrimary" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button type="button" className="BtnGhost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default TransactionForm;
