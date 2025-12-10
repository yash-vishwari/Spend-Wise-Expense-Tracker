import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData.username, formData.password);
      
      if (response.access_token) {
        onLogin(response.access_token, response.user);
        navigate('/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      username: 'student',
      password: 'student@1234'
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <i className="fas fa-wallet"></i>
          </div>
          <h1>Welcome to Spend Wise</h1>
          <p className="login-subtitle">Smart Personal Finance Tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">
              <FaUser />
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock />
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="input"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Signing in...
              </>
            ) : (
              <>
                <FaSignInAlt />
                Sign In
              </>
            )}
          </button>

          <div className="demo-section">
            <p className="demo-title">Demo Account</p>
            <button 
              type="button" 
              onClick={handleDemoLogin}
              className="btn btn-secondary demo-btn"
            >
              <i className="fas fa-user-secret"></i>
              Use Demo Credentials
            </button>
            <div className="demo-credentials">
              <p><strong>Username:</strong> demo</p>
              <p><strong>Password:</strong> demo123</p>
            </div>
          </div>
        </form>

        <div className="login-footer">
          <p>Track your expenses. Manage your budget. Achieve your financial goals.</p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .login-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 40px;
          width: 100%;
          max-width: 440px;
          animation: slideUp 0.6s ease-out;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .login-logo {
          font-size: 48px;
          color: #3b82f6;
          margin-bottom: 16px;
        }
        
        .login-header h1 {
          font-size: 28px;
          color: #1f2937;
          margin-bottom: 8px;
          font-weight: 700;
        }
        
        .login-subtitle {
          color: #6b7280;
          font-size: 16px;
        }
        
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .alert-error {
          background-color: #fee2e2;
          color: #dc2626;
          border: 1px solid #fca5a5;
        }
        
        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }
        
        .login-btn {
          height: 48px;
          font-size: 16px;
          font-weight: 600;
        }
        
        .spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .demo-section {
          text-align: center;
          padding: 20px;
          background-color: #f9fafb;
          border-radius: 12px;
          border: 1px dashed #d1d5db;
        }
        
        .demo-title {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 12px;
          font-weight: 500;
        }
        
        .demo-btn {
          margin-bottom: 12px;
        }
        
        .demo-credentials {
          font-size: 12px;
          color: #6b7280;
          text-align: left;
        }
        
        .demo-credentials p {
          margin: 4px 0;
        }
        
        .login-footer {
          margin-top: 32px;
          text-align: center;
          color: #9ca3af;
          font-size: 14px;
          line-height: 1.5;
        }
        
        @media (max-width: 480px) {
          .login-card {
            padding: 24px;
          }
          
          .login-header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;