import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import TopNav from "../components/TopNav";
import "./Transfers.css";
import { useUser } from "../../context/UserContext";
export default function Transfers() {
  const [transactions, setTransactions] = useState([]);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { refreshUserData } = useUser();

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await api.get("/transfers/my_transactions");
      setTransactions(res.data);
      setPageLoading(false);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions");
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      fetchTransactions();
    }

    return () => {
      isMounted = false;
    };
  }, [fetchTransactions]);

  const handleSend = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!recipient.trim() || !amount) {
      setError("Please fill all fields");
      return;
    }

    const amountValue = parseFloat(amount);
    if (amountValue <= 0 || isNaN(amountValue)) {
      setError("Amount must be greater than 0");
      return;
    }

    setLoading(true);

    try {
      await api.post("/transfers", {
        recipient: recipient.trim(),
        amount: amountValue,
      });
      
      setRecipient("");
      setAmount("");
      setSuccess("Transfer successful! 💸");
      fetchTransactions();
      // Refresh user data to update TopNav balance
      refreshUserData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Transfer error:", err);
      setError(err.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;

    try {
      await api.post("/transfers/delete_transaction", { id });
      fetchTransactions();
      // Refresh user data to update TopNav balance
      refreshUserData();
      setSuccess("Transaction deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete transaction");
    }
  };

  const totalSent = transactions.reduce(
    (sum, t) => sum + parseFloat(t.amount || 0),
    0
  );

  return (
    <div>
      <TopNav />
      <div className="container transfers-container" style={{marginTop:"20px"}}>
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Money Transfers</h1>
          <p className="page-subtitle">Send money to other users instantly</p>
        </div>

        {/* Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon money-icon">💰</div>
            <div className="summary-content">
              <span className="summary-label">Total Sent</span>
              <span className="summary-value">
                $
                {totalSent.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon stats-icon">📊</div>
            <div className="summary-content">
              <span className="summary-label">Transactions</span>
              <span className="summary-value">{transactions.length}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon">❌</span>
            <span className="alert-message">{error}</span>
            <button
              className="alert-close"
              onClick={() => setError("")}
              aria-label="Close error message"
            >
              &times;
            </button>
          </div>
        )}

        {success && (
          <div className="alert alert-success" role="status">
            <span className="alert-icon">✅</span>
            <span className="alert-message">{success}</span>
            <button
              className="alert-close"
              onClick={() => setSuccess("")}
              aria-label="Close success message"
            >
              &times;
            </button>
          </div>
        )}

        {/* Send Money Form */}
        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">Send Money</h2>
            <p className="section-description">
              Transfer funds to other users quickly and securely
            </p>
          </div>

          <form onSubmit={handleSend} className="transfer-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="recipient" className="form-label">
                  Recipient Username
                </label>
                <input
                  id="recipient"
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter recipient's username"
                  disabled={loading}
                  className="form-input"
                  aria-describedby={error ? "recipient-error" : undefined}
                />
              </div>

              <div className="form-group">
                <label htmlFor="amount" className="form-label">
                  Amount ($)
                </label>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  disabled={loading}
                  className="form-input"
                  aria-describedby={error ? "amount-error" : undefined}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-large"
            >
              {loading ? (
                <>
                  <span className="btn-icon">⏳</span>
                  Processing...
                </>
              ) : (
                <>
                    Send Money
                </>
              )}
            </button>
          </form>
        </div>

        {/* Transaction History */}
        <div className="history-section">
          <div className="section-header">
            <h2 className="section-title">Transaction History</h2>
            <p className="section-description">Your recent money transfers</p>
          </div>

          {transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3 className="empty-title">No transactions yet</h3>
              <p className="empty-description">
                Your transfer history will appear here
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th scope="col" className="table-header">
                      Recipient
                    </th>
                    <th scope="col" className="table-header amount-header">
                      Amount
                    </th>
                    <th scope="col" className="table-header date-header">
                      Date
                    </th>
                    <th scope="col" className="table-header action-header">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr
                      key={t.id || `${t.recipient}-${t.transactionDate}`}
                      className="table-row"
                    >
                      <td className="table-data recipient-cell">
                        <span className="user-icon" aria-hidden="true">
                          👤
                        </span>
                        <span className="recipient-name">{t.recipient}</span>
                      </td>
                      <td className="table-data amount-cell">
                        <span className="amount-value">
                          $
                          {parseFloat(t.amount || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                      <td className="table-data date-cell">
                        <span className="date-value">
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          ) : "Invalid Date"}
                        </span>
                      </td>
                      <td className="table-data action-cell">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="btn btn-danger btn-small"
                          title="Delete transaction"
                          aria-label={`Delete transaction with ${t.recipient}`}
                        >
                          <span className="btn-icon" aria-hidden="true">
                            🗑️
                          </span>
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
      </div>
    </div>
  );
}