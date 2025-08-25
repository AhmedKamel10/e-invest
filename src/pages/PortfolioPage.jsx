import React, { useEffect, useState } from "react";
import api from "../api/axios";
import TopNav from "../components/TopNav";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyTicker, setBuyTicker] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [sellTicker, setSellTicker] = useState("");
  const [sellShares, setSellShares] = useState("");
  const [addBalanceAmount, setAddBalanceAmount] = useState("");
  const [userBalance, setUserBalance] = useState(0);

  const fetchPortfolio = async () => {
    try {
      const res = await api.get("/investments/portfolio");
      setPortfolio(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching portfolio:", err);
      setLoading(false);
    }
  };

  const fetchUserBalance = async () => {
    try {
      const res = await api.get("/users/user_profile");
      setUserBalance(res.data.balance || 0);
    } catch (err) {
      console.error("Error fetching user balance:", err);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    fetchUserBalance();
  }, []);

  const handleBuy = async (e) => {
    e.preventDefault();
    if (!buyTicker || !buyAmount) return alert("Please fill both fields");
    try {
      await api.post(`/investments/invest/buy?ticker=${buyTicker}&amountUsd=${buyAmount}`);
      fetchPortfolio();
      fetchUserBalance();
      setBuyTicker("");
      setBuyAmount("");
      alert("Bought successfully!");
    } catch (err) {
      console.error(err);
      alert("Error buying shares: " + (err.response?.data || err.message));
    }
  };

  const handleSell = async (e) => {
    e.preventDefault();
    if (!sellTicker || !sellShares) return alert("Please fill both fields");
    try {
      await api.post(`/investments/invest/sell?ticker=${sellTicker}&sharesToSell=${sellShares}`);
      fetchPortfolio();
      fetchUserBalance();
      setSellTicker("");
      setSellShares("");
      alert("Sold successfully!");
    } catch (err) {
      console.error(err);
      alert("Error selling shares: " + (err.response?.data || err.message));
    }
  };

  const handleAddBalance = async (e) => {
    e.preventDefault();
    if (!addBalanceAmount) return alert("Please enter amount");
    try {
      await api.post("/users/add_balance", addBalanceAmount);
      fetchUserBalance();
      setAddBalanceAmount("");
      alert("Balance added successfully!");
    } catch (err) {
      console.error(err);
      alert("Error adding balance: " + (err.response?.data || err.message));
    }
  };

  if (loading) return <div style={{ padding: "2rem" }}>Loading portfolio...</div>;

  // Prepare chart data
  const totalProfit = portfolio.reduce((sum, inv) => sum + (inv.profit || 0), 0);

  const lineChartData = {
    labels: portfolio.map((inv) => inv.tickerSymbol),
    datasets: [
      {
        label: "Profit (USD)",
        data: portfolio.map((inv) => inv.profit ?? 0),
        fill: false,
        borderColor: "blue",
        tension: 0.3,
      },
    ],
  };

  const pieChartData = {
    labels: portfolio.map((inv) => inv.tickerSymbol),
    datasets: [
      {
        label: "Investment Distribution",
        data: portfolio.map((inv) => inv.amountUsd ?? 0),
        backgroundColor: portfolio.map((_, idx) =>
          ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"][idx % 6]
        ),
      },
    ],
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <TopNav />
      <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "1rem" }}>My Portfolio</h1>
        <p><strong>Current Balance:</strong> ${userBalance.toFixed(2)}</p>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {/* Holdings Table */}
          <div style={{
            flex: 1,
            minWidth: "350px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "1rem",
            backgroundColor: "#f9f9f9"
          }}>
            <h2 style={{ marginBottom: "1rem" }}>Holdings</h2>
            {portfolio.length === 0 ? (
              <p>No investments yet.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem", textAlign: "left" }}>Ticker</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem", textAlign: "right" }}>Shares</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem", textAlign: "right" }}>Amount USD</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem", textAlign: "right" }}>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ padding: "0.75rem", borderBottom: "1px solid #eee" }}>{inv.tickerSymbol}</td>
                      <td style={{ padding: "0.75rem", borderBottom: "1px solid #eee", textAlign: "right" }}>
                        {(inv.sharesPurchased ?? 0).toFixed(2)}
                      </td>
                      <td style={{ padding: "0.75rem", borderBottom: "1px solid #eee", textAlign: "right" }}>
                        ${(inv.amountUsd ?? 0).toFixed(2)}
                      </td>
                      <td style={{
                        padding: "0.75rem",
                        borderBottom: "1px solid #eee",
                        textAlign: "right",
                        color: (inv.profit ?? 0) >= 0 ? "green" : "red",
                        fontWeight: "bold"
                      }}>
                        ${(inv.profit ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Buy/Sell Forms */}
          <div style={{
            flex: 1,
            minWidth: "350px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "1rem",
            backgroundColor: "#f9f9f9"
          }}>
            <h2>Add Balance</h2>
            <form onSubmit={handleAddBalance} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
              <input
                type="number"
                placeholder="Amount USD"
                value={addBalanceAmount}
                onChange={(e) => setAddBalanceAmount(e.target.value)}
              />
              <button type="submit" style={{ padding: "0.5rem", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "5px" }}>
                Add Balance
              </button>
            </form>

            <h2>Quick Buy</h2>
            <form onSubmit={handleBuy} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <input type="text" placeholder="Ticker" value={buyTicker} onChange={(e) => setBuyTicker(e.target.value)} />
              <input type="number" placeholder="Amount USD" value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} />
              <button type="submit" style={{ padding: "0.5rem", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px" }}>
                Buy
              </button>
            </form>

            <h2 style={{ marginTop: "1rem" }}>Quick Sell</h2>
            <form onSubmit={handleSell} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <input type="text" placeholder="Ticker" value={sellTicker} onChange={(e) => setSellTicker(e.target.value)} />
              <input type="number" placeholder="Shares to Sell" value={sellShares} onChange={(e) => setSellShares(e.target.value)} />
              <button type="submit" style={{ padding: "0.5rem", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "5px" }}>
                Sell
              </button>
            </form>
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginTop: "2rem" }}>
          <div style={{
            flex: 1,
            minWidth: "350px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "1rem",
            backgroundColor: "#f9f9f9"
          }}>
            <h2>Total Profit</h2>
            <Line data={lineChartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
            <p style={{ marginTop: "1rem", fontWeight: "bold" }}>Total Profit: <span style={{ color: totalProfit >= 0 ? "green" : "red" }}>${totalProfit.toFixed(2)}</span></p>
          </div>

          <div style={{
            flex: 1,
            minWidth: "350px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "1rem",
            backgroundColor: "#f9f9f9"
          }}>
            <h2>Portfolio Distribution</h2>
            {portfolio.length > 0 ? (
              <Pie data={pieChartData} options={{ responsive: true, plugins: { legend: { position: "right" } } }} />
            ) : (
              <p>No investments to display.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
