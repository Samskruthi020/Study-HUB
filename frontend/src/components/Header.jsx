import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const Header = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    navigate('/', { replace: true });
    window.dispatchEvent(new Event('authChange'));
  };

  const fetchStreakData = async () => {
    const token = localStorage.getItem('token');
    if (!token || !isAuthenticated) return;

    try {
      const response = await axios.get('/auth/streak', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStreakData(response.data);
    } catch (error) {
      console.error('Error fetching streak data:', error);
    }
  };

  useEffect(() => {
    const updateAuth = () => setIsAuthenticated(!!localStorage.getItem('token'));
    updateAuth();
    window.addEventListener('authChange', updateAuth);
    window.addEventListener('storage', updateAuth);
    return () => {
      window.removeEventListener('authChange', updateAuth);
      window.removeEventListener('storage', updateAuth);
    };
  }, []);

  useEffect(() => {
    fetchStreakData();
  }, [isAuthenticated]);

  // Single icon display only; number reflects streak

  return (
    <nav
      className="navbar shadow-sm"
      style={{
        background: 'linear-gradient(90deg, #f8fafc 60%, #e0e7ff 100%)',
        padding: '0.5rem 0',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        className="container d-flex align-items-center justify-content-between"
        style={{ minHeight: 64 }}
      >
        {/* Brand */}
        <Link
          className="navbar-brand fw-bold"
          to="/"
          style={{
            fontSize: 28,
            color: '#3b82f6',
            letterSpacing: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            textDecoration: 'none',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sh-gradient" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
              <circle cx="19" cy="19" r="16" fill="url(#sh-gradient)" />
              <text x="19" y="24" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold" fontFamily="'Inter', 'Arial', sans-serif">SH</text>
              {/* Book icon */}
              <g>
                <rect x="25" y="10" width="7" height="10" rx="1.5" fill="#fff" fillOpacity="0.9" stroke="#6366f1" strokeWidth="1.2" />
                <rect x="26.5" y="11.5" width="4" height="7" rx="0.8" fill="#6366f1" fillOpacity="0.18" />
                <line x1="26.5" y1="13.5" x2="30.5" y2="13.5" stroke="#6366f1" strokeWidth="0.8" />
                <line x1="26.5" y1="15.5" x2="30.5" y2="15.5" stroke="#6366f1" strokeWidth="0.8" />
              </g>
            </svg>
          </span>
          <span style={{ fontWeight: 700, fontSize: 30, marginLeft: 2 }}>StudyHub</span>
        </Link>
        {/* Nav Items */}
        <ul
          className="navbar-nav d-flex flex-row align-items-center mb-0"
          style={{ gap: 12 }}
        >
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link className="nav-link px-3" to="/dashboard" style={{ fontWeight: 500 }}>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <a
                  className="btn btn-outline-primary px-3"
                  style={{ fontWeight: 500 }}
                  href="/ai-predictor"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  AI Recommendations
                </a>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3" to="/resources" style={{ fontWeight: 500 }}>
                  Resources
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3" to="/notes" style={{ fontWeight: 500 }}>
                  Notes
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3" to="/contact" style={{ fontWeight: 500 }}>
                  Contact
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3" to="/faq" style={{ fontWeight: 500 }}>
                  FAQ
                </Link>
              </li>
              {/* Streak Display */}
              {streakData.currentStreak > 0 && (
                <li className="nav-item">
                  <div className="d-flex align-items-center px-2" style={{ 
                    background: '#fff5f0', 
                    borderRadius: '20px', 
                    border: '1px solid #ff6b35',
                    padding: '4px 12px'
                  }}>
                    <span style={{ color: '#ff6b35', fontSize: '16px', marginRight: '4px' }}>🔥</span>
                    <span style={{ 
                      color: '#ff6b35', 
                      fontWeight: 700, 
                      fontSize: '14px',
                      minWidth: '20px',
                      textAlign: 'center'
                    }}>
                      {streakData.currentStreak}
                    </span>
                  </div>
                </li>
              )}
              <li className="nav-item d-flex flex-column align-items-center" style={{ minWidth: 64 }}>
                <Link className="nav-link px-3" to="/profile" style={{ fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 0, background: 'none', border: 'none' }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="16" fill="#6366f1" fillOpacity="0.15" />
                    <ellipse cx="16" cy="13.5" rx="6" ry="5.5" fill="#6366f1" />
                    <ellipse cx="16" cy="24" rx="9" ry="5" fill="#6366f1" fillOpacity="0.5" />
                    <ellipse cx="16" cy="24.5" rx="7" ry="3.5" fill="#fff" fillOpacity="0.7" />
                  </svg>
                  <span style={{ fontSize: 13, color: '#3730a3', fontWeight: 600, marginTop: 2, lineHeight: 1 }}>
                    {(() => {
                      try {
                        const user = JSON.parse(localStorage.getItem('user'));
                        return user?.name || 'Profile';
                      } catch {
                        return 'Profile';
                      }
                    })()}
                  </span>
                </Link>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-outline-danger px-3 ms-2 logout-btn"
                  style={{ fontWeight: 500 }}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link className="nav-link px-3" to="/" style={{ fontWeight: 500 }}>
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3" to="/login" style={{ fontWeight: 500 }}>
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3" to="/register" style={{ fontWeight: 500 }}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
      {/* Responsive styles */}
      <style>{`
        .navbar-nav .nav-link, .navbar-nav .btn {
          transition: background 0.2s, color 0.2s;
          border-radius: 6px;
        }
        .navbar-nav .nav-link:hover, .navbar-nav .btn:hover {
          background: #e0e7ff;
          color: #3730a3;
        }
        .logout-btn:hover { background: #ef4444 !important; color: #fff !important; border-color: #ef4444 !important; }
        @media (max-width: 900px) {
          .container.d-flex {
            flex-direction: column;
            align-items: stretch !important;
            gap: 8px;
          }
          .navbar-nav.d-flex {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 0;
          }
        }
      `}</style>
    </nav>
  );
};

export default Header;
