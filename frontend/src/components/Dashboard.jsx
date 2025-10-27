import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard = () => {
  const subjects = [
    { name: 'DSA', icon: '📗', link: '/dsa' },
    { name: 'Operating Systems', icon: '🖥', link: '/os' },
    { name: 'Computer Networks', icon: '🌐', link: '/cn' },
    { name: 'DBMS', icon: '💾', link: '/dbms' },
    { name: 'Java Programming', icon: '☕', link: '/java' },
    { name: 'Python', icon: '🐍', link: '/python' },
    { name: 'Web Development', icon: '🌍', link: '/web-dev' },
    { name: 'Software Engineering', icon: '📋', link: '/se' },
    { name: 'Machine Learning', icon: '🧠', link: '/ml' },
    { name: 'Placement Prep', icon: '🏆', link: '/placement' },
  ];

  const [searchTerm, setSearchTerm] = useState("");

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //

  return (
    <div style={{ background: 'linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)', minHeight: '100vh', paddingBottom: 48 }}>
      <div className="container py-5">
        {/* Hero */}
        <div className="text-center mb-4">
          <h1 className="fw-bold mb-2" style={{ color: '#0f172a', fontSize: 36 }}>Welcome back 👋</h1>
          <p className="mb-0" style={{ color: '#475569' }}>Jump into resources, practice quizzes, or jot quick notes.</p>
        </div>

        {/* Streak Display removed on home as requested */}

        {/* Shortcuts */}
        <div className="text-center mb-3" style={{ color: '#64748b', fontWeight: 700 }}>Shortcuts</div>
        <div className="row justify-content-center mb-5 g-3 g-md-4">
          {[
            { to: '/resources', label: 'View Resources', icon: '📚', variant: 'primary' },
            { to: '/notes', label: 'Take Notes', icon: '📝', variant: 'outline-primary' },
            { to: '/Quiz', label: 'Practice Quizzes', icon: '🧑‍💻', variant: 'success' },
            { to: '/code-editor', label: 'Code Editor', icon: '💻', variant: 'outline-dark' },
          ].map((c) => (
            <div key={c.to} className="col-6 col-md-3">
              <Link to={c.to} className="text-decoration-none">
                <div className="shadow-sm p-3 shortcut-card h-100 text-center" style={{ borderRadius: 16, background: '#ffffff', border: '1px solid #e5e7eb' }}>
                  <div className="mb-2" style={{ fontSize: 28 }}>{c.icon}</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>{c.label}</div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="input-group mb-5 w-75 mx-auto shadow-sm" style={{ borderRadius: 9999, overflow: 'hidden', background: '#fff' }}>
          <span className="input-group-text bg-white border-0" style={{ fontSize: 18 }}>🔎</span>
          <input
            type="text"
            className="form-control border-0"
            placeholder="Search subjects or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'none', fontSize: 18 }}
          />
        </div>

        {/* Trending */}
        <div className="text-center shadow-sm mb-5 p-3" style={{ borderRadius: 14, fontWeight: 500, fontSize: 16, background: '#eef2ff' }}>
          🔥 Trending: Top 100 DSA Interview Questions
          <Link to="/interview-dsa" className="ms-2 text-decoration-underline" style={{ color: '#6366f1' }}>Explore</Link>
        </div>

        {/* What's New */}
        <div className="text-center my-5">
          <h3 className="fw-bold" style={{ color: '#0f172a' }}>What’s New</h3>
          <p className="text-muted" style={{ fontSize: 16 }}>Fresh content and improvements every week.</p>
        </div>

        {/* Subjects Grid */}
        <h3 className="text-center mb-4" style={{ color: '#3730a3', fontWeight: 700 }}>
          📖 Explore Subjects
        </h3>
        <div className="row">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject, idx) => (
              <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={idx}>
                <div className="card shadow-sm h-100 subject-card" style={{ borderRadius: 18, transition: 'transform 0.18s, box-shadow 0.18s', background: '#f8fafc' }}>
                  <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                    <div className="display-5 mb-2" style={{ fontSize: 38 }}>{subject.icon}</div>
                    <h5 className="card-title mb-2" style={{ color: '#6366f1', fontWeight: 700 }}>{subject.name}</h5>
                    <Link to={subject.link} className="btn btn-outline-primary btn-sm mt-3 px-4">Start Learning</Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted">No subjects found.</p>
          )}
        </div>

        {/* Quote removed as requested */}
      </div>
      {/* Subject card hover effect */}
      <style>{`
        .subject-card:hover {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 8px 32px 0 rgba(99,102,241,0.10), 0 1.5px 6px 0 rgba(55,48,163,0.08);
          background: #e0e7ff !important;
        }
        .btn-outline-primary:hover { background: rgba(99,102,241,0.10); }
        .shortcut-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(15,23,42,0.10) !important; }
      `}</style>
    </div>
  );
};

export default Dashboard;
