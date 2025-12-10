import React, { useState, useEffect } from 'react';
import { budgetsAPI } from '../services/api';
import { FaPlus, FaTrash, FaEdit, FaChartLine } from 'react-icons/fa';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBudget, setNewBudget] = useState({
    category: 'Food',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const categories = [
    'Food(Khan Paan)',
    'Transport',
    'Entertainment',
    'Housing',
    'Healthcare',
    'Education',
    'Shopping',
    'Utilities',
    'Other'
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await budgetsAPI.getAll();
      const data = response.data || response.budgets || [];
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      // Sample data
      const sampleData = [
        { id: 1, category: 'Food', amount: 0, month: 12, year: 2025 },
        { id: 2, category: 'Transport', amount: 0, month: 12, year: 2025 },
        { id: 3, category: 'Entertainment', amount: 0, month: 12, year: 2025 },
        { id: 4, category: 'Utilities', amount: 0, month: 12, year: 2025 }
      ];
      setBudgets(sampleData);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = async () => {
    if (!newBudget.amount || newBudget.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await budgetsAPI.create(newBudget);
      await fetchBudgets();
      setNewBudget({
        category: 'Food',
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });
      alert('Budget set successfully!');
    } catch (error) {
      console.error('Error adding budget:', error);
      alert('Failed to set budget. Please try again.');
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;

    try {
      await budgetsAPI.delete(id);
      await fetchBudgets();
      alert('Budget deleted successfully!');
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBudget(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotalBudget = () => {
    return budgets.reduce((sum, budget) => sum + (budget.amount || 0), 0);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading budgets...</p>
      </div>
    );
  }

  return (
    <div className="budgets-page">
      <div className="page-header">
        <h1>Budget Management</h1>
        <p>Set and track your spending limits</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3">
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>Total Budget</h3>
            <p className="stat-value">₹{calculateTotalBudget().toLocaleString()}</p>
            <p className="stat-label">Across all categories</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f0f9ff', color: '#0ea5e9' }}>
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>Active Budgets</h3>
            <p className="stat-value">{budgets.length}</p>
            <p className="stat-label">Categories with budget</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#22c55e' }}>
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>Avg. Budget</h3>
            <p className="stat-value">
              ₹{budgets.length > 0 ? Math.round(calculateTotalBudget() / budgets.length).toLocaleString() : '0'}
            </p>
            <p className="stat-label">Per category</p>
          </div>
        </div>
      </div>

      {/* Set New Budget */}
      <div className="card">
        <h2>Set New Budget</h2>
        <div className="budget-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={newBudget.category}
                onChange={handleInputChange}
                className="select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={newBudget.amount}
                onChange={handleInputChange}
                placeholder="Enter budget amount"
                className="input"
                min="0"
                step="100"
              />
            </div>

            <div className="form-group">
              <label>Month</label>
              <select
                name="month"
                value={newBudget.month}
                onChange={handleInputChange}
                className="select"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                name="year"
                value={newBudget.year}
                onChange={handleInputChange}
                className="input"
                min="2023"
                max="2030"
              />
            </div>

            <div className="form-group">
              <label>&nbsp;</label>
              <button 
                onClick={handleAddBudget}
                className="btn btn-success"
                style={{ height: '42px' }}
              >
                <FaPlus /> Set Budget
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Budgets List */}
      <div className="card">
        <div className="table-header">
          <h3>Your Budgets</h3>
          <span className="badge">{budgets.length} budgets</span>
        </div>
        
        {budgets.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map(budget => (
                  <tr key={budget.id}>
                    <td>
                      <span className={`badge badge-${budget.category.toLowerCase()}`}>
                        {budget.category}
                      </span>
                    </td>
                    <td className="amount">₹{budget.amount?.toLocaleString()}</td>
                    <td>{months[budget.month - 1]}</td>
                    <td>{budget.year}</td>
                    <td>
                      <span className="status-active">Active</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-secondary btn-sm">
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="btn btn-danger btn-sm"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">
            <p>No budgets set yet. Set your first budget above!</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .budgets-page {
          padding-bottom: 40px;
        }
        
        .budget-form {
          margin-top: 20px;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }
        
        .status-active {
          display: inline-block;
          padding: 4px 12px;
          background-color: #dcfce7;
          color: #166534;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        
        @media (max-width: 1024px) {
          .form-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .grid-cols-3 {
            grid-template-columns: repeat(1, 1fr);
          }
          
          .form-grid {
            grid-template-columns: repeat(1, 1fr);
          }
          
          .stat-card {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default Budgets;