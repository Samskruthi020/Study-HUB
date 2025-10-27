import React from 'react';
import { Link } from 'react-router-dom';

const subjects = [
  { name: 'DSA', path: '/notes/dsa' },
  { name: 'Operating Systems', path: '/notes/os' },
  { name: 'Computer Networks', path: '/notes/cn' },
  { name: 'DBMS', path: '/notes/dbms' },
  { name: 'Java Programming', path: '/notes/java' },
  { name: 'Python', path: '/notes/python' },
  { name: 'Web Development', path: '/notes/web-dev' },
  { name: 'Software Engineering', path: '/notes/se' },
  { name: 'Machine Learning', path: '/notes/ml' },
];

const Notes = () => (
  <div className="container mt-5">
    <h2 className="mb-4 text-center">📝 Select a Subject to Take Notes</h2>
    <div className="row">
      {subjects.map((subj, i) => (
        <div className="col-md-4 mb-4" key={i}>
          <div className="card shadow-lg h-100">
            <div className="card-body d-flex align-items-center justify-content-center">
              <Link to={subj.path} className="btn btn-lg btn-outline-primary w-100 py-4 fw-bold">
                {subj.name}
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Notes;
