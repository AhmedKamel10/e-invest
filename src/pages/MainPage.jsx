import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "../MainPage.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import TopNav from "../components/TopNav";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MainPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState({});
  const [modal, setModal] = useState({ type: null, company: null, value: "" });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.get("/companies");
        setCompanies(response.data);

        const allHistory = {};
        await Promise.all(
          response.data.map(async (company) => {
            const hist = await api.get(`/api/stock-history/${company.tickerSymbol}`);
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

  if (loading) return <div className="loading">Loading companies...</div>;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: { label: (ctx) => `$${ctx.raw.toFixed(2)}` },
      },
    },
    interaction: { mode: "nearest", intersect: false },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#555" } },
      y: { grid: { color: "rgba(200,200,200,0.2)" }, ticks: { color: "#555" } },
    },
  };

  const openModal = (type, company) => setModal({ type, company, value: "" });
  const closeModal = () => setModal({ type: null, company: null, value: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!modal.value || Number(modal.value) <= 0) return alert("Enter a valid amount/shares");

      let endpoint = "";
      let params = {};

      if (modal.type === "BUY") {
        endpoint = "/investments/invest/buy";
        params = { ticker: modal.company.tickerSymbol, amountUsd: Number(modal.value) };
      } else if (modal.type === "SELL") {
        endpoint = "/investments/invest/sell";
        params = { ticker: modal.company.tickerSymbol, sharesToSell: Number(modal.value) };
      }

      await api.post(endpoint, null, { params });
      alert(`${modal.type} successful!`);
      closeModal();
    } catch (err) {
      console.error(err);
      alert(`${modal.type} failed: ${err.response?.data || err.message}`);
    }
  };

  return (
    <div>
      {/* 🔝 Auto-scrolling Top Slider */}
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
                ${company.lastStockPrice.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <TopNav />

      <div className="main-container">
        {/* 🔄 Auto-sliding Company Cards */}
        <div className="cards-slider">
          <div className="cards-slider-track">
            {companies.map((company) => {
              const chartInfo = historyData[company.tickerSymbol] || [];
              const chartData = {
                labels: chartInfo.map((h) => new Date(h.priceDate).toLocaleDateString()),
                datasets: [
                  {
                    label: "Price",
                    data: chartInfo.map((h) => h.stockPrice),
                    borderColor: "rgb(75,192,192)",
                    backgroundColor: (ctx) => {
                      const chart = ctx.chart;
                      const { ctx: c, chartArea } = chart;
                      if (!chartArea) return null;
                      const gradient = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                      gradient.addColorStop(0, "rgba(75,192,192,0.1)");
                      gradient.addColorStop(1, "rgba(75,192,192,0.4)");
                      return gradient;
                    },
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0,
                  },
                ],
              };

              return (
                <div className="company-card" key={company.id}>
                  <h2>
                    {company.name} ({company.tickerSymbol})
                  </h2>
                  <p>Last Price: ${company.lastStockPrice.toFixed(2)}</p>
                  <p>available Shares: {company.availableShares}</p>
                  <p>Valuation : ${ (company.lastStockPrice * company.totalShares).toFixed(2) }</p>
                  <div className="chart-container" style={{ height: "200px" }}>
                    {chartInfo.length > 0 ? (
                      <Line data={chartData} options={chartOptions} />
                    ) : (
                      <p>No history data</p>
                    )}
                  </div>
                  <div className="card-buttons">
                    <button className="buy-btn" onClick={() => openModal("BUY", company)}>Buy</button>
                    <button className="sell-btn" onClick={() => openModal("SELL", company)}>Sell</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 📊 Companies Table */}
        <table className="companies-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Name</th>
              <th>Last Price</th>
              <th>Total Shares</th>
              <th>Price Change</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => {
              const chartInfo = historyData[company.tickerSymbol] || [];
              const previousPrice =
                chartInfo.length > 1
                  ? chartInfo[chartInfo.length - 2].stockPrice
                  : company.lastStockPrice;
              const change = company.lastStockPrice - previousPrice;
              const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;

              return (
                <tr key={company.id}>
                  <td>{company.tickerSymbol}</td>
                  <td>{company.name}</td>
                  <td>${company.lastStockPrice.toFixed(2)}</td>
                  <td>{company.totalShares}</td>
                  <td style={{ color: change >= 0 ? "green" : "red" }}>
                    {change >= 0 ? "+" : ""}
                    {change.toFixed(2)} ({changePercent.toFixed(2)}%)
                  </td>
                  <td>
                    <button className="buy-btn" onClick={() => openModal("BUY", company)}>Buy</button>
                    <button className="sell-btn" onClick={() => openModal("SELL", company)}>Sell</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* 🛒 Buy/Sell Modal */}
        {modal.type && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{modal.type} {modal.company.name}</h2>
              <form onSubmit={handleSubmit}>
                <label>{modal.type === "BUY" ? "Amount (USD):" : "Shares:"}</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={modal.value}
                  onChange={(e) => setModal({ ...modal, value: e.target.value })}
                  required
                />
                <div className="modal-buttons">
                  <button type="submit" className="buy-btn">{modal.type}</button>
                  <button type="button" className="sell-btn" onClick={closeModal}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
