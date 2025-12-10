import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardAPI } from '../services/api';
import { FaDownload, FaFilter, FaCalendar, FaChartBar } from 'react-icons/fa';

const Reports = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getSummary();
      setDashboardData(response.data || response);
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Sample data
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
        weekly_data: [
          { week: 'Week 1', amount: 2800 },
          { week: 'Week 2', amount: 3200 },
          { week: 'Week 3', amount: 2950 },
          { week: 'Week 4', amount: 3500 }
        ],
        daily_data: [
          { day: 'Mon', amount: 850 },
          { day: 'Tue', amount: 920 },
          { day: 'Wed', amount: 780 },
          { day: 'Thu', amount: 1100 },
          { day: 'Fri', amount: 950 },
          { day: 'Sat', amount: 1200 },
          { day: 'Sun', amount: 650 }
        ]
      };
      setDashboardData(sampleData);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!dashboardData) return [];
    
    switch (timeRange) {
      case 'daily':
        return dashboardData.daily_data || [];
      case 'weekly':
        return dashboardData.weekly_data || [];
      case 'monthly':
      default:
        return dashboardData.monthly_trend || [];
    }
  };

  const getCategoryData = () => {
    if (!dashboardData?.category_breakdown) return [];
    
    return Object.entries(dashboardData.category_breakdown).map(([name, value]) => ({
      name,
      value
    }));
  };

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      totalSpent: dashboardData?.total_spent || 0,
      categoryBreakdown: dashboardData?.category_breakdown || {},
      chartData: getChartData(),
      categoryData: getCategoryData()
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `spendwise_report_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Analytics & Reports</h1>
        <p>Detailed insights into your spending patterns</p>
      </div>

      {/* Time Range Filter */}
      <div className="card">
        <div className="filter-section">
          <div className="filter-header">
            <h3>
              <FaFilter /> Time Range
            </h3>
            <button className="btn btn-primary" onClick={exportReport}>
              <FaDownload /> Export Report
            </button>
          </div>
          
          <div className="time-range-buttons">
            <button 
              className={`time-range-btn ${timeRange === 'daily' ? 'active' : ''}`}
              onClick={() => setTimeRange('daily')}
            >
              <FaCalendar /> Daily
            </button>
            <button 
              className={`time-range-btn ${timeRange === 'weekly' ? 'active' : ''}`}
              onClick={() => setTimeRange('weekly')}
            >
              <FaCalendar /> Weekly
            </button>
            <button 
              className={`time-range-btn ${timeRange === 'monthly' ? 'active' : ''}`}
              onClick={() => setTimeRange('monthly')}
            >
              <FaCalendar /> Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4">
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            <FaChartBar />
          </div>
          <div className="stat-content">
            <h3>Total Spent</h3>
            <p className="stat-value">₹{dashboardData?.total_spent?.toLocaleString() || '0'}</p>
            <p className="stat-label">Overall</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f0f9ff', color: '#0ea5e9' }}>
            <FaChartBar />
          </div>
          <div className="stat-content">
            <h3>Categories</h3>
            <p className="stat-value">
              {dashboardData?.category_breakdown ? Object.keys(dashboardData.category_breakdown).length : '0'}
            </p>
            <p className="stat-label">Active</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#22c55e' }}>
            <FaChartBar />
          </div>
          <div className="stat-content">
            <h3>Avg. Daily</h3>
            <p className="stat-value">
              ₹{dashboardData?.total_spent ? Math.round(dashboardData.total_spent / 30).toLocaleString() : '0'}
            </p>
            <p className="stat-label">Spending</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
            <FaChartBar />
          </div>
          <div className="stat-content">
            <h3>Max Category</h3>
            <p className="stat-value">
              {dashboardData?.category_breakdown ? 
                Object.entries(dashboardData.category_breakdown)
                  .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A' : 
                'N/A'}
            </p>
            <p className="stat-label">Highest spending</p>
          </div>
        </div>
      </div>

      {/* Spending Trend Chart */}
      <div className="card">
        <h2>Spending Trend ({timeRange.charAt(0).toUpperCase() + timeRange.slice(1)})</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={timeRange === 'daily' ? 'day' : timeRange === 'weekly' ? 'week' : 'month'} />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Spending"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-2">
        {/* Bar Chart */}
        <div className="card">
          <h2>Category Breakdown</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getCategoryData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Chart */}
        <div className="card">
          <h2>Cumulative Spending</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={timeRange === 'daily' ? 'day' : timeRange === 'weekly' ? 'week' : 'month'} />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                  name="Cumulative"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Details */}
      <div className="card">
        <h2>Category Details</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Percentage</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {getCategoryData().map((item, index) => {
                const percentage = dashboardData?.total_spent ? 
                  ((item.value / dashboardData.total_spent) * 100).toFixed(1) : 0;
                
                return (
                  <tr key={index}>
                    <td>
                      <span className={`badge badge-${item.name.toLowerCase()}`}>
                        {item.name}
                      </span>
                    </td>
                    <td className="amount">₹{item.value?.toLocaleString()}</td>
                    <td>
                      <div className="percentage-bar">
                        <div 
                          className="percentage-fill"
                          style={{ width: `${percentage}%` }}
                        />
                        <span className="percentage-text">{percentage}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="trend-up">↑</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .reports-page {
          padding-bottom: 40px;
        }
        
        .filter-section {
          margin-bottom: 20px;
        }
        
        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .filter-header h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          color: #1f2937;
          font-weight: 600;
        }
        
        .time-range-buttons {
          display: flex;
          gap: 12px;
        }
        
        .time-range-btn {
          padding: 10px 20px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: white;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }
        
        .time-range-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }
        
        .time-range-btn.active {
          background-color: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        
        .chart-container {
          margin-top: 20px;
        }
        
        .percentage-bar {
          width: 100%;
          height: 24px;
          background-color: #f3f4f6;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
        }
        
        .percentage-fill {
          height: 100%;
          background-color: #3b82f6;
          border-radius: 12px;
          transition: width 0.3s ease;
        }
        
        .percentage-text {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #374151;
          font-size: 12px;
          font-weight: 600;
        }
        
        .trend-up {
          color: #10b981;
          font-weight: bold;
        }
        
        .trend-down {
          color: #ef4444;
          font-weight: bold;
        }
        
        @media (max-width: 1024px) {
          .grid-cols-4 {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .grid-cols-2 {
            grid-template-columns: repeat(1, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .grid-cols-4 {
            grid-template-columns: repeat(1, 1fr);
          }
          
          .time-range-buttons {
            flex-direction: column;
          }
          
          .filter-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
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

export default Reports;