import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      className="shadow-sm"
      style={{
        background: 'linear-gradient(90deg, #f8fafc 60%, #e0e7ff 100%)',
        borderTop: '1px solid #e5e7eb',
        padding: '1.5rem 0 1rem 0',
        marginTop: 48,
        textAlign: 'center',
        color: '#3730a3',
        fontWeight: 500,
        fontSize: 16,
      }}
    >
      <div className="container">
        <div style={{ marginBottom: 8 }}>
          © 2025 <span style={{ color: '#6366f1', fontWeight: 700 }}>StudyHub</span>. All rights reserved.
        </div>
        <div style={{ fontSize: 15 }}>
          <a
            href="https://github.com/Samskruthi020"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#6366f1', textDecoration: 'none', marginRight: 16 }}
          >
            GitHub
          </a>
          |
          <Link
            to="/contact"
            style={{ color: '#6366f1', textDecoration: 'none', marginLeft: 16 }}
          >
            Feedback
          </Link>
        </div>
      </div>
      <style>{`
        footer a:hover {
          color: #3730a3 !important;
          text-decoration: underline;
        }
        @media (max-width: 600px) {
          footer .container {
            font-size: 14px;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
