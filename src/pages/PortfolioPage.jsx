import React, { useEffect, useState } from "react";
import api from "../api/axios";
import TopNav from "../components/TopNav";
import StockTicker from "../../components/common/StockTicker/StockTicker";
import { useUser } from "../../context/UserContext";
import "../MainPage.css";

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
import "./PortfolioPage.css";

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
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ type: null, ticker: "", value: "" });
  const { cashBalance: userBalance, refreshUserData } = useUser();
  const [companies, setCompanies] = useState([]);
  const [historyData, setHistoryData] = useState({});
  const [addBalanceAmount, setAddBalanceAmount] = useState("");


  const fetchPortfolio = async () => {
    try {
      const res = await api.get("/investments/portfolio");
      setPortfolio(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching portfolio:", err);
      setError("Failed to fetch portfolio data");
      setLoading(false);
    }
  };

    useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.get("/companies");
        setCompanies(response.data);

        const allHistory = {};
        await Promise.all(
          response.data.map(async (company) => {
            const hist = await api.get(
              `/api/stock-history/${company.tickerSymbol}`
            );
            allHistory[company.tickerSymbol] = hist.data;
          })
        );
        setHistoryData(allHistory);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching companies or history:", error);
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);
  useEffect(() => {
    fetchPortfolio();
    // User balance is now managed by context, no need to fetch here
  }, []);

  const openModal = (type, ticker = "") =>
    setModal({ type, ticker, value: "" });
  const closeModal = () => setModal({ type: null, ticker: "", value: "" });

  const handleTrade = async (e) => {
    e.preventDefault();
    if (!modal.value || Number(modal.value) <= 0) {
      alert("Please enter a valid amount/shares");
      return;
    }

    try {
      let endpoint = "";
      let params = {};

      if (modal.type === "BUY") {
        endpoint = "/investments/invest/buy";
        params = {
          ticker: modal.ticker,
          amountUsd: Number(modal.value),
        };
      } else if (modal.type === "SELL") {
        endpoint = "/investments/invest/sell";
        params = {
          ticker: modal.ticker,
sharesToSell: parseFloat(Number(modal.value).toFixed(2))
        };
      }

      await api.post(endpoint, null, { params });
      alert(`${modal.type} operation successful!`);
      closeModal();
      fetchPortfolio();
      // Refresh user data in context to update TopNav
      refreshUserData();
    } catch (err) {
      console.error(err);
      alert(
        `${modal.type} failed: ${err.response?.data?.message || err.message}`
      );
    }
  };

const handleAddBalance = async (e) => {
  e.preventDefault();

  // ask user for amount directly in a prompt
  const amount = prompt("Enter the amount you want to add:");
  if (!amount || isNaN(amount)) return alert("Invalid amount");

  try {
    const res = await api.post("/users/add_balance", amount, {
      headers: { "Content-Type": "application/json" }
    });

    // if backend returns new balance
    console.log(res);
    const newBalance = res.data;
    refreshUserData(); // Refresh user data in context to update TopNav
    alert(`Balance added successfully! Your new balance is ${newBalance}`);
  } catch (err) {
    console.error(err);
    alert("Error adding balance: " + (err.response?.data || err.message));
  }
};


  // <TopNav />

  if (error)
    return (
      <div>
        <TopNav />
        <div className="container">
          <div className="error">{error}</div>
        </div>
      </div>
    );

  const totalInvested = portfolio.reduce(
    (sum, inv) => sum + (inv.amountUsd || 0),
    0
  );
  const totalProfit = portfolio.reduce(
    (sum, inv) => sum + (inv.profit || 0),
    0
  );

  const lineChartData = {
    labels: portfolio.map((inv) => inv.tickerSymbol),
    datasets: [
      {
        label: "Profit (USD)",
        data: portfolio.map((inv) => inv.profit ?? 0),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const pieChartData = {
    labels: portfolio.map((inv) => inv.tickerSymbol),
    datasets: [
      {
        label: "Investment Distribution",
        data: portfolio.map((inv) => inv.amountUsd ?? 0),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#8AC926",
          "#1982C4",
          "#6A4C93",
          "#F15BB5",
        ],
      },
    ],
  };

  return (
    <div>
            <div className="top-slider">
        <div className="top-slider-track">
          {companies.map((company) => (
            <div
              key={company.id}
              className="top-slider-card"
              onClick={() => openModal("BUY", company)}
            >
              <span className="ticker">{company.tickerSymbol}</span>
              <span className="price">
                ${company.lastStockPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <TopNav />
      <div className="container" style={{marginTop:"30px"}}>
        <h1>My Portfolio</h1>

        <div className="summary-cards">
          <div className="card">
            <h3>Current Balance</h3>
            <p className="balance">
              $
              {userBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              <button
                onClick={handleAddBalance}
                style={{
                  marginLeft: "10px",
                  padding: "5px 10px",
                  fontSize: "12px",
                }}
              >
                Add
              </button>
            </p>
          </div>

          <div className="card">
            <h3>Total Invested</h3>
            <p>
              $
              {totalInvested.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="card">
            <h3>Total Profit/Loss</h3>
            <p className={totalProfit >= 0 ? "positive" : "negative"}>
              $
              {totalProfit.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="card">
          <h2>Your Holdings</h2>
          {portfolio.length === 0 ? (
            <p>No investments yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Shares</th>
                    <th>Amount USD</th>
                    <th>Profit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.tickerSymbol}</td>
                      <td>
                        {(inv.sharesPurchased ?? 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        $
                        {(inv.amountUsd ?? 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        className={
                          (inv.profit ?? 0) >= 0 ? "positive" : "negative"
                        }
                      >
                        $
                        {(inv.profit ?? 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        <button
                          onClick={() => openModal("BUY", inv.tickerSymbol)}
                          style={{
                            marginRight: "5px",
                            padding: "5px 10px",
                            fontSize: "12px",
                            backgroundColor:"#4caf50"
                          }}
                        >
                          Buy 
                        </button>
                        <button
                          onClick={() => openModal("SELL", inv.tickerSymbol)}
                          style={{
                            padding: "5px 10px",
                            fontSize: "12px",
                            background: "#dc2626",
                          }}
                        >
                          Sell
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Charts */}
        {portfolio.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              marginTop: "20px",
            }}
          >
            <div className="card" style={{ flex: "1", minWidth: "300px" }}>
              <h2>Profit by Stock</h2>
              <Line data={lineChartData} options={{ responsive: true }} />
            </div>

            <div className="card" style={{ flex: "1", minWidth: "300px" }}>
              <h2>Portfolio Distribution</h2>
              <Pie data={pieChartData} options={{ responsive: true }} />
            </div>
          </div>
        )}

        {/* Trade Modal */}
        {modal.type && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>
                {modal.type} {modal.ticker}
              </h2>
              <form onSubmit={handleTrade}>
                <label>
                  {modal.type === "BUY" ? "Amount (USD):" : "Shares to Sell:"}
                </label>
<input
  type="text"
  value={modal.value}
  onChange={(e) => setModal({ ...modal, value: e.target.value })}
  required
  autoFocus
/>

                <div className="modal-buttons">
                  <button type="submit" className="buy-btn">
                    {modal.type}
                  </button>
                  <button type="button" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;