import React from 'react';
import { useNavigate } from 'react-router-dom';
const DSA = () => {
  const navigate = useNavigate();
  return (
    <div className="container mt-4">
      <h2>📗 Data Structures & Algorithms (DSA)</h2>
      <p className="text-muted">Master the fundamentals of data structures and algorithms for interviews and problem solving.</p>

      <h5 className="mt-4">🌐 Useful Links</h5>
      <ul>
        <li><a href="https://www.geeksforgeeks.org/data-structures/" target="_blank" rel="noopener noreferrer">GeeksforGeeks DSA</a></li>
        <li><a href="https://leetcode.com" target="_blank" rel="noopener noreferrer">LeetCode Practice</a></li>
        <li><a href="https://cses.fi/problemset/" target="_blank" rel="noopener noreferrer">CSES Problem Set</a></li>
      </ul>

      <h5 className="mt-4">📘 Notes & PDFs</h5>
      <ul>
        <li><a href="/pdfs/dsa-notes.pdf" target="_blank">Download DSA Notes (PDF)</a></li>
      </ul>

      <h5 className="mt-4">🧪 Practice Quizzes</h5>
      <button 
  className="btn btn-outline-info mt-3" 
  onClick={() => navigate(`/quiz/Java`)} // or `Python`, `OS`, etc.
      >
  🧠 Take Quiz
</button>

      <p>Coming soon: DSA quizzes with instant evaluation.</p>
    </div>
  );
};

export default DSA;
