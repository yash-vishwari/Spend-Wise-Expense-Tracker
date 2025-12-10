import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaMoneyBill, FaChartBar, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/dashboard" className="navbar-logo">
            <i className="fas fa-wallet"></i>
            <span>Spend Wise</span>
          </Link>
        </div>

        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-link">
            <FaHome />
            <span>Dashboard</span>
          </Link>
          <Link to="/expenses" className="navbar-link">
            <FaMoneyBill />
            <span>Expenses</span>
          </Link>
          <Link to="/budgets" className="navbar-link">
            <FaChartBar />
            <span>Budgets</span>
          </Link>
          <Link to="/reports" className="navbar-link">
            <FaChartBar />
            <span>Reports</span>
          </Link>
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <FaUser />
            <span>{user?.username || 'User'}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        
        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
        }
        
        .navbar-brand {
          display: flex;
          align-items: center;
        }
        
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #1f2937;
          font-size: 20px;
          font-weight: 700;
        }
        
        .navbar-logo i {
          font-size: 24px;
          color: #3b82f6;
        }
        
        .navbar-menu {
          display: flex;
          gap: 32px;
          margin-left: 48px;
        }
        
        .navbar-link {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #6b7280;
          font-weight: 500;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.3s ease;
        }
        
        .navbar-link:hover {
          background-color: #f3f4f6;
          color: #1f2937;
        }
        
        .navbar-link.active {
          background-color: #eff6ff;
          color: #3b82f6;
        }
        
        .navbar-user {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background-color: #f3f4f6;
          border-radius: 6px;
          color: #4b5563;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .navbar {
            padding: 0 16px;
          }
          
          .navbar-menu {
            display: none;
          }
          
          .navbar-user span {
            display: none;
          }
          
          .user-info span {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;