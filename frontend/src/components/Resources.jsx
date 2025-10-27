import React, { useEffect, useState } from "react";
import axios from "axios";

const Resources = () => {
  const [resources, setResources] = useState([]);

  const categories = [
    "Core Subjects",
    "Coding Platforms",
    "Placement Resources",
    "Mini Project Ideas",
    "Downloadable Notes",
    "Books",
  ];

  useEffect(() => {
    axios
      .get('http://localhost:5001/resources')
      .then((res) => {
        setResources(res.data);
      })
      .catch((err) => console.error("Error fetching resources:", err));
  }, []);

  const renderCategory = (category) => {
    const filtered = resources.filter((r) => r.category === category);
    if (!filtered.length) return null;

    return (
      <div className="mb-5">
        <h4 className="mb-3 pb-2" style={{ borderBottom: '2px solid #e0e7ff', color: '#3730a3', fontWeight: 700, letterSpacing: 0.5 }}>{category}</h4>
        <div className="row">
          {filtered.map((item, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card shadow-sm h-100 resource-card" style={{ borderRadius: 18, transition: 'transform 0.18s, box-shadow 0.18s', background: '#f8fafc' }}>
                <div className="card-body d-flex flex-column justify-content-between align-items-start">
                  <div>
                    <h5 className="card-title mb-2" style={{ color: '#6366f1', fontWeight: 700 }}>{item.title}</h5>
                    <p className="card-text text-muted small mb-2">Type: {item.type}</p>
                  </div>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-primary btn-sm mt-3 px-4"
                  >
                    {category === "Books" ? "View Book" : "View Resource"}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container py-5 min-vh-100">
      <div className="shadow-lg rounded-4 p-5 mb-5 text-center bg-white" style={{ maxWidth: 700, margin: '0 auto' }}>
        <h2 className="fw-bold mb-2" style={{ color: '#3730a3', fontSize: 32 }}>
          <span role="img" aria-label="books">📚</span> Study Resources
        </h2>
        <p className="lead mb-0" style={{ color: '#6366f1', fontWeight: 500 }}>
          Curated resources for every CS subject, platform, and more.
        </p>
      </div>
      {categories.map((cat) => (
        <div key={cat}>{renderCategory(cat)}</div>
      ))}
      {/* Resource card hover effect */}
      <style>{`
        .resource-card:hover {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 8px 32px 0 rgba(99,102,241,0.10), 0 1.5px 6px 0 rgba(55,48,163,0.08);
          background: #e0e7ff !important;
        }
      `}</style>
    </div>
  );
};

export default Resources;
