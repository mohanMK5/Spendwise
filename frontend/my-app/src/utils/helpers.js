// Small helper functions used by more than one page.

// Turns any axios error into a short message we can show on the screen.
export function getErrorMessage(err) {
  // err.response exists when the server answered with an error (400, 401...)
  if (err.response) {
    return err.response.data?.message || "Something went wrong";
  }
  // No response at all = the server is off or the address is wrong
  return "Cannot reach the server. Is the backend running?";
}

// 1500 -> "₹1,500"
export function formatMoney(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

// "2026-10-02T00:00:00.000Z" -> "2 Oct 2026"
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
