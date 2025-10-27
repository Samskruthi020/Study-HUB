import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const subjects = [
  { name: 'Java', icon: '☕' },
  { name: 'Python', icon: '🐍' },
  { name: 'Operating Systems', icon: '🖥' },
  { name: 'DBMS', icon: '💾' },
  { name: 'DSA', icon: '📗' },
  { name: 'Computer Networks', icon: '🌐' },
  { name: 'Web Development', icon: '🌍' },
  { name: 'Software Engineering', icon: '📋' },
  { name: 'Machine Learning', icon: '🧠' },
  { name: 'Placement Prep', icon: '🏆' },
];

const Quiz = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-5 min-vh-100">
      <div className="shadow-lg rounded-4 p-5 mb-5 text-center bg-white" style={{ maxWidth: 700, margin: '0 auto' }}>
        <h2 className="fw-bold mb-2" style={{ color: '#3730a3', fontSize: 32 }}>
          <span role="img" aria-label="quiz">🧑‍💻</span> Choose a Subject to Start Quiz
        </h2>
        <p className="lead mb-0" style={{ color: '#6366f1', fontWeight: 500 }}>
          Test your knowledge with 20+ randomized questions per subject!
        </p>
      </div>
      <div className="row justify-content-center">
        {subjects.map((subject, idx) => (
          <div className="col-6 col-md-4 col-lg-3 mb-4" key={idx}>
            <div
              className="card h-100 shadow-sm text-center p-3 quiz-subject-card"
              role="button"
              onClick={() => navigate(`/quiz/${subject.name}`)}
              style={{ cursor: 'pointer', borderRadius: 18, transition: 'transform 0.18s, box-shadow 0.18s', background: '#f8fafc' }}
            >
              <div className="display-4 mb-2" style={{ fontSize: 38 }}>{subject.icon}</div>
              <h5 className="card-title mb-2" style={{ color: '#6366f1', fontWeight: 700 }}>{subject.name}</h5>
              <button className="btn btn-outline-primary mt-3 px-4">Start Quiz</button>
            </div>
          </div>
        ))}
      </div>
      {/* Subject card hover effect */}
      <style>{`
        .quiz-subject-card:hover {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 8px 32px 0 rgba(99,102,241,0.10), 0 1.5px 6px 0 rgba(55,48,163,0.08);
          background: #e0e7ff !important;
        }
      `}</style>
    </div>
  );
};

export default Quiz;
