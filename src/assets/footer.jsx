import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-text">© {new Date().getFullYear()} eFinance. All rights reserved.</p>
        <nav className="footer-nav">
          <a href="/dashboard">Dashboard</a>
          <a href="/portfolio">Portfolio</a>
          <a href="/transactions">Transactions</a>
          <a href="/profile">Profile</a>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
