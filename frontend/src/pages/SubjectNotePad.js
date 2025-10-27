// src/pages/SubjectNotePad.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios'; // Axios instance with baseURL

const SubjectNotePad = () => {
  const { subject } = useParams();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');

  // Load notes from backend
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get(`/notes/${subject}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotes(res.data[0]?.content || '');
      } catch (err) {
        console.error('Error fetching notes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [subject, token]);

  // Save note to backend (on blur or interval or click)
  const saveNotes = async () => {
    try {
      setSaving(true);
      await api.post(
        '/notes',
        { subject, content: notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>📝 Notes - {subject.toUpperCase()}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <textarea
            className="form-control"
            rows="15"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            placeholder={`Write your ${subject} notes here...`}
          />
          <button className="btn btn-outline-primary mt-3" onClick={() => {
  const blob = new Blob([notes], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${subject}-notes.txt`;
  link.click();
}}>
  📥 Download Notes
</button>

          <div className="mt-2 text-end">
            {saving ? <span className="text-secondary">Saving...</span> : <span className="text-success">✔ Saved</span>}
          </div>
        </>
      )}
    </div>
  );
};

export default SubjectNotePad;
