import React, { useState, useEffect } from 'react';
import { expensesAPI } from '../services/api';
import { FaPlus, FaTrash, FaEdit, FaFilter, FaDownload } from 'react-icons/fa';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: 'all',
    search: ''
  });

  const categories = [
    'All',
    'Food',
    'Transport',
    'Entertainment',
    'Housing',
    'Healthcare',
    'Education',
    'Shopping',
    'Utilities',
    'Other'
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, filter]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expensesAPI.getAll();
      const data = response.data?.expenses || response.expenses || [];
      setExpenses(data);
      setFilteredExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      // Sample data
      const sampleData = [
        { id: 1, description: 'Grocery Shopping', category: 'Food', amount: 1250, date: '2024-04-15' },
        { id: 2, description: 'Petrol', category: 'Transport', amount: 2000, date: '2024-04-14' },
        { id: 3, description: 'Movie Tickets', category: 'Entertainment', amount: 800, date: '2024-04-13' },
        { id: 4, description: 'Internet Bill', category: 'Utilities', amount: 1200, date: '2024-04-12' },
        { id: 5, description: 'Medicine', category: 'Healthcare', amount: 650, date: '2024-04-11' },
        { id: 6, description: 'Books', category: 'Education', amount: 450, date: '2024-04-10' },
        { id: 7, description: 'Clothes', category: 'Shopping', amount: 1800, date: '2024-04-09' },
        { id: 8, description: 'Restaurant', category: 'Food', amount: 950, date: '2024-04-08' }
      ];
      setExpenses(sampleData);
      setFilteredExpenses(sampleData);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    // Apply category filter
    if (filter.category !== 'all') {
      filtered = filtered.filter(exp => exp.category === filter.category);
    }

    // Apply search filter
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(exp => 
        exp.description.toLowerCase().includes(searchTerm) ||
        exp.category.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredExpenses(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await expensesAPI.delete(id);
      await fetchExpenses();
      alert('Expense deleted successfully!');
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense.');
    }
  };

  const calculateTotal = () => {
    return filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  };

  const exportToCSV = () => {
    const headers = ['Description', 'Category', 'Amount', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredExpenses.map(exp => 
        `"${exp.description}","${exp.category}","${exp.amount}","${exp.date}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className="expenses-page">
      <div className="page-header">
        <h1>Expense Management</h1>
        <p>Track and manage all your expenses</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3">
        <div className="card stat-card">
          <h3>Total Expenses</h3>
          <p className="stat-value">{expenses.length}</p>
        </div>
        <div className="card stat-card">
          <h3>Filtered</h3>
          <p className="stat-value">{filteredExpenses.length}</p>
        </div>
        <div className="card stat-card">
          <h3>Total Amount</h3>
          <p className="stat-value">₹{calculateTotal().toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="filter-section">
          <h3>Filter Expenses</h3>
          <div className="filters">
            <div className="filter-group">
              <label>Category</label>
              <select
                name="category"
                value={filter.category}
                onChange={handleFilterChange}
                className="select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                name="search"
                value={filter.search}
                onChange={handleFilterChange}
                placeholder="Search expenses..."
                className="input"
              />
            </div>
            
            <div className="filter-group">
              <label>&nbsp;</label>
              <button className="btn btn-secondary" onClick={exportToCSV}>
                <FaDownload /> Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card">
        <div className="table-header">
          <h3>All Expenses</h3>
          <span className="badge">{filteredExpenses.length} records</span>
        </div>
        
        {filteredExpenses.length > 0 ? (
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
                {filteredExpenses.map(expense => (
                  <tr key={expense.id}>
                    <td>{expense.description}</td>
                    <td>
                      <span className={`badge badge-${expense.category.toLowerCase()}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="amount">₹{expense.amount?.toLocaleString()}</td>
                    <td>{expense.date}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-secondary btn-sm">
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDelete(expense.id)}
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
            <p>No expenses found. Try changing your filters.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .expenses-page {
          padding-bottom: 40px;
        }
        
        .page-header {
          margin-bottom: 30px;
        }
        
        .page-header h1 {
          font-size: 32px;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .page-header p {
          color: #6b7280;
          font-size: 16px;
        }
        
        .stat-card {
          text-align: center;
          padding: 24px;
        }
        
        .stat-card h3 {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 12px;
          font-weight: 500;
        }
        
        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
        }
        
        .filter-section {
          margin-bottom: 20px;
        }
        
        .filter-section h3 {
          font-size: 18px;
          color: #1f2937;
          margin-bottom: 20px;
          font-weight: 600;
        }
        
        .filters {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        
        .filter-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }
        
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .table-header h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }
        
        .amount {
          font-weight: 600;
          color: #1f2937;
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        
        @media (max-width: 768px) {
          .grid-cols-3 {
            grid-template-columns: repeat(1, 1fr);
          }
          
          .filters {
            grid-template-columns: repeat(1, 1fr);
          }
          
          .action-buttons {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default Expenses;