import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardAPI, expensesAPI } from '../services/api';
import { FaPlus, FaTrash, FaChartLine, FaMoneyBill, FaShoppingCart, FaCar, FaFilm, FaHome, FaHeartbeat, FaGraduationCap, FaTags, FaBolt } from 'react-icons/fa';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({
    description: '',
    category: 'Food',
    amount: ''
  });

  const categoryIcons = {
    'Food': <FaShoppingCart />,
    'Transport': <FaCar />,
    'Entertainment': <FaFilm />,
    'Housing': <FaHome />,
    'Healthcare': <FaHeartbeat />,
    'Education': <FaGraduationCap />,
    'Shopping': <FaTags />,
    'Utilities': <FaBolt />,
    'Other': <FaMoneyBill />
  };

  const categoryColors = {
    'Food': '#f97316',
    'Transport': '#3b82f6',
    'Entertainment': '#ec4899',
    'Housing': '#8b5cf6',
    'Healthcare': '#10b981',
    'Education': '#06b6d4',
    'Shopping': '#f59e0b',
    'Utilities': '#6366f1',
    'Other': '#6b7280'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, expensesRes] = await Promise.all([
        dashboardAPI.getSummary(),
        expensesAPI.getAll()
      ]);
      
      setDashboardData(dashboardRes.data || dashboardRes);
      setExpenses(expensesRes.data?.expenses || expensesRes.expenses || []);
    } catch (error) {
      console.log('Using sample data:', error);
      // Sample data for demo
      const sampleData = {
        total_spent: 12450,
        category_breakdown: {
          'Food': 3200,
          'Transport': 2800,
          'Entertainment': 1800,
          'Housing': 2500,
          'Healthcare': 1200,
          'Other': 950
        },
        monthly_trend: [
          { month: 'Jan', total: 10500 },
          { month: 'Feb', total: 11200 },
          { month: 'Mar', total: 9800 },
          { month: 'Apr', total: 12450 }
        ],
        recent_expenses: [
          { id: 1, description: 'Grocery Shopping', category: 'Food', amount: 1250, date: '2024-04-15' },
          { id: 2, description: 'Petrol', category: 'Transport', amount: 2000, date: '2024-04-14' },
          { id: 3, description: 'Movie Tickets', category: 'Entertainment', amount: 800, date: '2024-04-13' },
          { id: 4, description: 'Internet Bill', category: 'Utilities', amount: 1200, date: '2024-04-12' },
          { id: 5, description: 'Medicine', category: 'Healthcare', amount: 650, date: '2024-04-11' }
        ]
      };
      
      setDashboardData(sampleData);
      setExpenses(sampleData.recent_expenses);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.description.trim() || !newExpense.amount) {
      alert('Please fill all fields');
      return;
    }

    try {
      await expensesAPI.create({
        description: newExpense.description,
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        date: new Date().toISOString().split('T')[0]
      });
      
      await fetchData();
      setNewExpense({ description: '', category: 'Food', amount: '' });
      alert('Expense added successfully!');
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await expensesAPI.delete(id);
      await fetchData();
      alert('Expense deleted successfully!');
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  // Prepare data for charts
  const pieData = dashboardData?.category_breakdown ? 
    Object.entries(dashboardData.category_breakdown).map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || '#6b7280'
    })) : [];

  const barData = dashboardData?.monthly_trend || [];

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="subtitle">Track and analyze your spending patterns</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => window.scrollTo(0, document.body.scrollHeight)}>
            <FaPlus /> Add Expense
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4">
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            <FaMoneyBill />
          </div>
          <div className="stat-content">
            <h3>Total Spent</h3>
            <p className="stat-value">₹{dashboardData?.total_spent?.toLocaleString() || '0'}</p>
            <p className="stat-label">This month</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f0f9ff', color: '#0ea5e9' }}>
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>Categories</h3>
            <p className="stat-value">{dashboardData?.category_breakdown ? Object.keys(dashboardData.category_breakdown).length : '0'}</p>
            <p className="stat-label">Active categories</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#22c55e' }}>
            <FaShoppingCart />
          </div>
          <div className="stat-content">
            <h3>Expenses</h3>
            <p className="stat-value">{expenses.length}</p>
            <p className="stat-label">Total transactions</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
            <FaMoneyBill />
          </div>
          <div className="stat-content">
            <h3>Avg/Expense</h3>
            <p className="stat-value">
              ₹{expenses.length > 0 ? Math.round(dashboardData?.total_spent / expenses.length).toLocaleString() : '0'}
            </p>
            <p className="stat-label">Average spending</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2">
        {/* Pie Chart */}
        <div className="card">
          <h2>Spending by Category</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ₹${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">
              <p>No category data available</p>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="card">
          <h2>Monthly Trend</h2>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Total']} />
                <Legend />
                <Bar dataKey="total" fill="#3b82f6" name="Total Spent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">
              <p>No trend data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card">
        <div className="card-header">
          <h2>Recent Expenses</h2>
          <span className="badge">{expenses.length} transactions</span>
        </div>
        
        {expenses.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>
                      <div className="expense-desc">
                        <span className="expense-icon">
                          {categoryIcons[expense.category] || <FaMoneyBill />}
                        </span>
                        {expense.description}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${expense.category.toLowerCase()}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="amount-cell">
                      <span className="amount">₹{expense.amount?.toLocaleString()}</span>
                    </td>
                    <td>{expense.date}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">
            <p>No expenses recorded yet. Add your first expense below!</p>
          </div>
        )}
      </div>

      {/* Add Expense Form */}
      <div className="card">
        <h2>Add New Expense</h2>
        <div className="add-expense-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                name="description"
                value={newExpense.description}
                onChange={handleInputChange}
                placeholder="What did you spend on?"
                className="input"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={newExpense.category}
                onChange={handleInputChange}
                className="select"
              >
                <option value="Food">Food & Dining</option>
                <option value="Transport">Transportation</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Housing">Housing</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Shopping">Shopping</option>
                <option value="Utilities">Utilities</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={newExpense.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                className="input"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>&nbsp;</label>
              <button 
                onClick={handleAddExpense}
                className="btn btn-success"
                style={{ height: '42px' }}
              >
                <FaPlus /> Add Expense
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          padding-bottom: 40px;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .dashboard-header h1 {
          font-size: 32px;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .subtitle {
          color: #6b7280;
          font-size: 16px;
        }
        
        .header-actions {
          display: flex;
          gap: 12px;
        }
        
        .stat-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
        }
        
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        
        .stat-content h3 {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 12px;
          color: #9ca3af;
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .card-header h2 {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }
        
        .expense-desc {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .expense-icon {
          color: #6b7280;
          font-size: 16px;
        }
        
        .amount-cell {
          font-weight: 600;
        }
        
        .amount {
          color: #1f2937;
        }
        
        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }
        
        .no-data {
          text-align: center;
          padding: 60px 20px;
          color: #9ca3af;
        }
        
        .add-expense-form {
          margin-top: 20px;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        
        @media (max-width: 1024px) {
          .grid-cols-4 {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .grid-cols-2 {
            grid-template-columns: repeat(1, 1fr);
          }
          
          .form-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
          
          .grid-cols-4 {
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

export default Dashboard;