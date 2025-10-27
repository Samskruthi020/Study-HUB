import React, { useState } from 'react';
import axios from '../api/axios';

const allSubjects = [
  'Java', 'Python', 'Operating Systems', 'DBMS', 'DSA',
  'Computer Networks', 'Web Development', 'Software Engineering', 'Machine Learning', 'Placement Prep'
];

const AIPredictor = () => {
  const [examDate, setExamDate] = useState('');
  const [stress, setStress] = useState(5);
  const [confidence, setConfidence] = useState(5);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubjectChange = (e) => {
    const { value, checked } = e.target;
    setSelectedSubjects((prev) =>
      checked ? [...prev, value] : prev.filter((s) => s !== value)
    );
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/ai-recommendations', {
        examDate,
        subjects: selectedSubjects,
        stress,
        confidence,
        hoursPerDay,
        mode: 'ml-predictor'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 600 }}>
      <h2 className="mb-4 text-center">AI Study Predictor</h2>
      <form onSubmit={handlePredict} className="card p-4 shadow">
        <div className="mb-3">
          <label className="form-label">Exam Date</label>
          <input
            type="date"
            className="form-control"
            value={examDate}
            onChange={e => setExamDate(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Stress Level: <b>{stress}</b></label>
          <input
            type="range"
            min={1}
            max={10}
            value={stress}
            onChange={e => setStress(Number(e.target.value))}
            className="form-range"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Preparation Confidence: <b>{confidence}</b></label>
          <input
            type="range"
            min={1}
            max={10}
            value={confidence}
            onChange={e => setConfidence(Number(e.target.value))}
            className="form-range"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Hours Available Per Day: <b>{hoursPerDay}</b></label>
          <input
            type="range"
            min={1}
            max={12}
            value={hoursPerDay}
            onChange={e => setHoursPerDay(Number(e.target.value))}
            className="form-range"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Select Subjects</label>
          <div className="d-flex flex-wrap gap-2">
            {allSubjects.map(subj => (
              <div key={subj} className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  value={subj}
                  id={`ai-predictor-subj-${subj}`}
                  checked={selectedSubjects.includes(subj)}
                  onChange={handleSubjectChange}
                />
                <label className="form-check-label" htmlFor={`ai-predictor-subj-${subj}`}>{subj}</label>
              </div>
            ))}
          </div>
        </div>
        <button className="btn btn-primary w-100" type="submit" disabled={loading || !examDate || selectedSubjects.length === 0}>
          {loading ? 'Predicting...' : 'Predict My Success'}
        </button>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
      {results && (
        <div className="card p-4 shadow mt-4">
          <h5 className="mb-3">📊 Prediction Results</h5>
          <div className="mb-2">
            <label>Predicted Readiness</label>
            <div className="progress mb-2">
              <div className="progress-bar bg-success" style={{ width: `${results.readiness !== undefined ? results.readiness : 0}%` }}>
                {results.readiness !== undefined ? `${results.readiness}%` : '0%'}
              </div>
            </div>
          </div>
          <div className="mb-2">
            <label>Risk of Burnout</label>
            <div className="progress mb-2">
              <div className="progress-bar bg-danger" style={{ width: `${results.burnout !== undefined ? results.burnout : 0}%` }}>
                {results.burnout !== undefined ? `${results.burnout}%` : '0%'}
              </div>
            </div>
          </div>
          <div className="mb-2">
            <label>Probability of Syllabus Completion</label>
            <div className="progress mb-2">
              <div className="progress-bar bg-info" style={{ width: `${results.completion !== undefined ? results.completion : 0}%` }}>
                {results.completion !== undefined ? `${results.completion}%` : '0%'}
              </div>
            </div>
          </div>
          <div className="mb-2">
            <label>Recommended Daily Study Time</label>
            <div className="progress mb-2">
              <div className="progress-bar bg-warning" style={{ width: `${results.dailyStudy !== undefined ? Math.min(results.dailyStudy * 10, 100) : 0}%` }}>
                {results.dailyStudy !== undefined ? `${results.dailyStudy} hrs` : '0 hrs'}
              </div>
            </div>
          </div>
          <div className="alert alert-info mt-3">
            <div dangerouslySetInnerHTML={{ __html: results.advice || '' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPredictor; 