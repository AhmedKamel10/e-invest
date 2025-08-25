import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const TopNav = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get("/users/user_profile");
        setUsername(res.data.username);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };

    fetchUserProfile();
  }, []);

  const [portfolioSummary, setPortfolioSummary] = useState({
    cashBalance: 0,
    totalValue: 0,
    profit: 0,
    profitPercentage: 0,
  });

  useEffect(() => {
    const fetchPortfolioSummary = async () => {
      try {
        const res = await api.get("/portfolio/my-portfolio/summary");
        setPortfolioSummary(res.data);
      } catch (err) {
        console.error("Failed to fetch portfolio summary", err);
      }
    };

    fetchPortfolioSummary();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const { cashBalance, profit, profitPercentage } = portfolioSummary;

  return (
    <nav className="topnav">
      <div className="left-section">
        <img style={{width:"70px"}} src="https://www.efinance.com.eg/wp-content/uploads/2022/06/e-finance-logo-2.jpg"></img>
        <h1 style={{marginTop:"20px", marginLeft:"-30px"}} onClick={() => navigate("/dashboard")}>
         -invest
        </h1>
        <div className="nav-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/portfolio")}>Portfolio</button>
          <button onClick={() => navigate("/companies")}>Companies</button>
        </div>
      </div>

      <div className="right-section">
        {username && <span className="username">Hello, <p1 style={{"font-weight": "bold"}}>{username}</p1></span>}

        <span className={`profit ${profit >= 0 ? "positive" : "negative"}`}>
          Cash: ${cashBalance.toFixed(2)} | Profit: ${profit.toFixed(2)} ({profitPercentage.toFixed(2)}%)
        </span>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default TopNav;
