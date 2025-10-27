import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import defaultAvatar from '../assets/default-avatar.png'; // You may need to add a default avatar image

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const Profile = () => {
  const [user, setUser] = useState({});
  const [quizHistory, setQuizHistory] = useState([]);
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastQuizDate: null,
    streakHistory: []
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const quizzesPerPage = 5;
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
      setQuizHistory(response.data.user.quizHistory || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to localStorage user data
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
    } catch (e) {
      console.error("Failed to parse user:", e);
    }
  }
    } finally {
      setLoading(false);
    }
  };

  const fetchStreakData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

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
    fetchUserProfile();
    fetchStreakData();
}, []);

  // Remove the useEffect that refetches on user.profileImage change
  // useEffect(() => {
  //   if (user.profileImage) {
  //     fetchUserProfile();
  //   }
  // }, [user.profileImage]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatStreakDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-danger';
  };

  // Render fire emojis for streak
  const renderStreakFires = (streak) => {
    const fires = [];
    for (let i = 0; i < Math.min(streak, 10); i++) {
      fires.push('🔥');
    }
    return fires.join('');
  };

  // Calculate overall statistics
  const calculateStats = () => {
    if (quizHistory.length === 0) return null;
    
    const totalQuizzes = quizHistory.length;
    const totalScore = quizHistory.reduce((sum, quiz) => sum + quiz.score, 0);
    const totalQuestions = quizHistory.reduce((sum, quiz) => sum + quiz.totalQuestions, 0);
    const averagePercentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
    
    const bestQuiz = quizHistory.reduce((best, current) => {
      const currentPercentage = (current.score / current.totalQuestions) * 100;
      const bestPercentage = (best.score / best.totalQuestions) * 100;
      return currentPercentage > bestPercentage ? current : best;
    });
    
    const bestPercentage = Math.round((bestQuiz.score / bestQuiz.totalQuestions) * 100);
    
    // Count unique subjects
    const uniqueSubjects = [...new Set(quizHistory.map(quiz => quiz.subject))].length;
    
    return {
      totalQuizzes,
      averagePercentage,
      bestPercentage,
      bestSubject: bestQuiz.subject,
      uniqueSubjects,
      totalScore,
      totalQuestions
    };
  };

  // ML-powered summary/advice
  const getMLSummary = () => {
    if (quizHistory.length === 0) return 'No quiz data available.';
    const stats = calculateStats();
    const trend = quizHistory.length > 1
      ? quizHistory[quizHistory.length - 1].score - quizHistory[0].score
      : 0;
    let advice = '';
    if (stats.averagePercentage >= 80) {
      advice = 'Excellent performance! Keep up the great work and try to maintain your consistency.';
    } else if (stats.averagePercentage >= 60) {
      advice = 'Good job! Focus on your weaker subjects and aim for more consistency.';
    } else {
      advice = 'There is room for improvement. Review your mistakes and try to practice regularly.';
    }
    if (trend > 0) advice += ' Your scores are improving over time.';
    else if (trend < 0) advice += ' Your scores have decreased recently. Try to review and revise.';
    else advice += ' Your performance is stable.';
    advice += `\nBest subject: ${stats.bestSubject}. Subjects attempted: ${stats.uniqueSubjects}.`;
    return advice;
  };

  // Download PDF report
  const handleDownloadReport = () => {
    const stats = calculateStats();
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('StudyHub User Report', 14, 18);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${user.name || ''}`, 14, 30);
    doc.text(`Email: ${user.email || ''}`, 14, 38);
    doc.text(`Joined: ${user.joined ? formatDate(user.joined) : ''}`, 14, 46);
    doc.text(`Quizzes Completed: ${quizHistory.length}`, 14, 54);
    if (stats) {
      doc.text(`Average Score: ${stats.averagePercentage}%`, 14, 62);
      doc.text(`Best Score: ${stats.bestPercentage}%`, 14, 70);
      doc.text(`Subjects Attempted: ${stats.uniqueSubjects}`, 14, 78);
      doc.text(`Total Correct: ${stats.totalScore}/${stats.totalQuestions}`, 14, 86);
      doc.text(`Best Subject: ${stats.bestSubject}`, 14, 94);
    }
    doc.setFont('helvetica', 'bold');
    doc.text('ML Performance Summary:', 14, 110);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(getMLSummary(), 180), 14, 118);
    // Quiz table
    if (quizHistory.length > 0) {
      autoTable(doc, {
        startY: 135,
        head: [['Quiz #', 'Subject', 'Score', 'Percentage', 'Date']],
        body: quizHistory.map((q, idx) => [
          idx + 1,
          q.subject,
          `${q.score}/${q.totalQuestions}`,
          `${Math.round((q.score / q.totalQuestions) * 100)}%`,
          formatDate(q.completedAt)
        ]),
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 10 },
      });
    }
    doc.save('StudyHub_User_Report.pdf');
  };

  // Pagination logic
  const indexOfLastQuiz = currentPage * quizzesPerPage;
  const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
  const currentQuizzes = quizHistory.slice(indexOfFirstQuiz, indexOfLastQuiz);
  const totalPages = Math.ceil(quizHistory.length / quizzesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleQuizClick = (quiz, index) => {
    setSelectedQuiz({ ...quiz, index });
    setShowQuizModal(true);
  };

  const stats = calculateStats();

  // Performance Line Graph Data
  const performanceData = {
    labels: quizHistory.map((quiz, idx) => `Quiz #${idx + 1}`),
    datasets: [
      {
        label: 'Score (%)',
        data: quizHistory.map(q => Math.round((q.score / q.totalQuestions) * 100)),
        fill: false,
        borderColor: '#6366f1',
        backgroundColor: '#6366f1',
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#6366f1',
        pointBorderWidth: 2,
      },
    ],
  };

  const performanceOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const idx = context.dataIndex;
            const quiz = quizHistory[idx];
            return ` ${quiz.subject} | ${formatDate(quiz.completedAt)} | ${quiz.score}/${quiz.totalQuestions} (${context.parsed.y}%)`;
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: '#3730a3',
          font: { weight: 600 },
        },
        grid: {
          color: '#e0e7ff',
        },
      },
      x: {
        ticks: {
          color: '#6366f1',
          font: { weight: 600 },
        },
        grid: {
          color: '#f3f4f6',
        },
      },
    },
  };

  // Helper to render quiz details
  const renderQuizDetails = (quiz) => {
    if (!quiz.questions || !quiz.userAnswers || !quiz.correctAnswers) {
      return <p>No detailed data available for this quiz attempt.</p>;
    }
    return (
      <div>
        <table className="table table-bordered" style={{ borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
          <thead style={{ background: '#e0e7ff' }}>
            <tr>
              <th>#</th>
              <th>Question</th>
              <th>Your Answer</th>
              <th>Correct Answer</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {quiz.questions.map((q, idx) => {
              const userAns = quiz.userAnswers[idx] || '';
              const correctAns = quiz.correctAnswers[idx] || '';
              const isCorrect = userAns === correctAns;
              return (
                <tr key={idx} style={{ background: isCorrect ? '#e0ffe0' : '#ffe0e0' }}>
                  <td>{idx + 1}</td>
                  <td>{q}</td>
                  <td className={isCorrect ? 'text-success' : 'text-danger'}>{userAns || <em>Not answered</em>}</td>
                  <td>{correctAns}</td>
                  <td>
                    {isCorrect ? (
                      <span className="badge bg-success">Correct</span>
                    ) : (
                      <span className="badge bg-danger">Wrong</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Handle profile image upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('token');
      const res = await axios.post('/auth/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(res.data.user); // update user state directly
      localStorage.setItem('user', JSON.stringify(res.data.user));
      // No need to refetch profile here
    } catch (err) {
      setUploadError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Calculate per-subject success percentages
  const getSubjectSuccess = () => {
    if (!quizHistory.length) return [];
    const subjectMap = {};
    quizHistory.forEach(q => {
      if (!subjectMap[q.subject]) subjectMap[q.subject] = [];
      subjectMap[q.subject].push((q.score / q.totalQuestions) * 100);
    });
    const subjects = Object.keys(subjectMap);
    const subjectSuccess = subjects.map(subj => {
      const avg = subjectMap[subj].reduce((a, b) => a + b, 0) / subjectMap[subj].length;
      return { subject: subj, percentage: Math.round(avg) };
    });
    return subjectSuccess;
  };
  const subjectSuccess = getSubjectSuccess();
  const overallSuccess = subjectSuccess.length
    ? Math.round(subjectSuccess.reduce((a, b) => a + b.percentage, 0) / subjectSuccess.length)
    : 0;

  // Helper for bar color
  const getBarColor = (pct) => {
    if (pct >= 80) return '#22c55e'; // green
    if (pct >= 60) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  if (loading) {
    return <div className="text-center mt-5">Loading profile...</div>;
  }

  return (
    <div className="container py-5 min-vh-100">
      {/* Download Report Button */}
      <div className="mb-4 d-flex justify-content-end">
        <button
          className="btn btn-outline-primary px-4 py-2 shadow-sm"
          style={{ fontWeight: 600, borderRadius: 8 }}
          onClick={handleDownloadReport}
        >
          <span role="img" aria-label="download">⬇️</span> Download Report
        </button>
      </div>
      <div className="row g-4">
        {/* User Info */}
        <div className="col-md-4">
          <div className="card p-4 shadow-lg mb-4" style={{ borderRadius: 18 }}>
            <h3 className="text-center mb-3" style={{ color: '#6366f1', fontWeight: 700 }}>
              Profile
            </h3>
            <div className="d-flex flex-column align-items-center mb-3">
              {/* Loading fallback for image */}
              {user ? (
                <img
                  src={user.profileImage || defaultAvatar}
                  alt="Profile"
                  style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid #6366f1', marginBottom: 8 }}
                  key={user.profileImage || 'default'}
                />
              ) : (
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#e0e7ff', marginBottom: 8 }} />
              )}
              <label htmlFor="profile-image-upload" className="btn btn-sm btn-outline-primary mt-2" style={{ fontWeight: 500 }}>
                {uploading ? 'Uploading...' : 'Change Photo'}
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                  disabled={uploading}
                />
              </label>
              {uploadError && <div className="text-danger small mt-1">{uploadError}</div>}
            </div>
            <p><strong>Name:</strong> <span style={{ color: '#3730a3' }}>{user.name || "Not provided"}</span></p>
            <p><strong>Email:</strong> <span style={{ color: '#6366f1' }}>{user.email || "Not available"}</span></p>
            <p><strong>Joined:</strong> {user.joined ? formatDate(user.joined) : "Date not available"}</p>
            <p><strong>Quizzes Completed:</strong> <span style={{ color: '#22c55e', fontWeight: 600 }}>{quizHistory.length}</span></p>
          </div>
          {/* Streak Information */}
          <div className="card p-4 shadow-lg mt-4" style={{ borderRadius: 18 }}>
            <div className="d-flex justify-content-center align-items-center">
              <span className="h2 mb-0 me-2" style={{ color: '#ff6b35' }}>
                {renderStreakFires(streakData.currentStreak)}
              </span>
              <span className="h3 mb-0" style={{ color: '#ff6b35', fontWeight: 700 }}>
                {streakData.currentStreak}
              </span>
            </div>
          </div>
          {/* Overall Statistics */}
          {stats && (
            <div className="card p-4 shadow-lg mt-4" style={{ borderRadius: 18 }}>
              <h4 className="mb-3" style={{ color: '#3730a3', fontWeight: 700 }}>
                <span role="img" aria-label="stats">📊</span> Overall Statistics
              </h4>
              <div className="row text-center">
                <div className="col-6 mb-3">
                  <div className="border rounded p-2" style={{ background: '#f8fafc' }}>
                    <h5 className={`mb-1 ${stats.averagePercentage >= 80 ? 'text-success' : stats.averagePercentage >= 60 ? 'text-warning' : 'text-danger'}`}>{stats.averagePercentage}%</h5>
                    <small className="text-muted">Average Score</small>
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <div className="border rounded p-2" style={{ background: '#f8fafc' }}>
                    <h5 className="mb-1 text-success">{stats.bestPercentage}%</h5>
                    <small className="text-muted">Best Score</small>
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <div className="border rounded p-2" style={{ background: '#f8fafc' }}>
                    <h5 className="mb-1 text-info">{stats.uniqueSubjects}</h5>
                    <small className="text-muted">Subjects Attempted</small>
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <div className="border rounded p-2" style={{ background: '#f8fafc' }}>
                    <h5 className="mb-1 text-primary">{stats.totalScore}/{stats.totalQuestions}</h5>
                    <small className="text-muted">Total Correct</small>
                  </div>
                </div>
              </div>
              <div className="text-center mt-2">
                <small className="text-muted">
                  Best Performance: <strong>{stats.bestSubject}</strong>
                </small>
              </div>
            </div>
          )}
          {/* Success to Crack MNCs Section */}
          {subjectSuccess.length > 0 && (
            <div className="card p-4 shadow-lg mt-4" style={{ borderRadius: 18 }}>
              <h4 className="mb-3" style={{ color: '#6366f1', fontWeight: 700 }}>
                <span role="img" aria-label="success">🏆</span> Success to Crack MNCs
              </h4>
              <div className="mb-3">
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Overall</div>
                <div style={{ background: '#e0e7ff', borderRadius: 8, height: 18, width: '100%', marginBottom: 12, position: 'relative' }}>
                  <div style={{
                    width: `${overallSuccess}%`,
                    background: getBarColor(overallSuccess),
                    height: '100%',
                    borderRadius: 8,
                    transition: 'width 0.4s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 13,
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    zIndex: 2,
                    minWidth: 36
                  }}>{overallSuccess}%</div>
                </div>
              </div>
              {subjectSuccess.map((s, idx) => (
                <div key={s.subject} className="mb-2">
                  <div style={{ fontWeight: 500, marginBottom: 2 }}>{s.subject}</div>
                  <div style={{ background: '#e0e7ff', borderRadius: 8, height: 14, width: '100%', position: 'relative' }}>
                    <div style={{
                      width: `${s.percentage}%`,
                      background: getBarColor(s.percentage),
                      height: '100%',
                      borderRadius: 8,
                      transition: 'width 0.4s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 11,
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      zIndex: 2,
                      minWidth: 36
                    }}>{s.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Quiz History */}
        <div className="col-md-8">
          <div className="card p-4 shadow-lg" style={{ borderRadius: 18 }}>
            <h3 className="mb-3" style={{ color: '#6366f1', fontWeight: 700 }}>
              <span role="img" aria-label="quiz">📊</span> Quiz History
            </h3>
            {quizHistory.length === 0 ? (
              <p className="text-muted text-center">No quizzes completed yet. <a href="/Quiz">Take your first quiz!</a></p>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-striped" style={{ borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                    <thead style={{ background: '#e0e7ff' }}>
                      <tr>
                        <th>Subject</th>
                        <th>Score</th>
                        <th>Percentage</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentQuizzes.map((quiz, index) => (
                        <tr key={index} className="quiz-history-row" style={{ cursor: 'pointer', transition: 'background 0.18s' }}>
                          <td>
                            <button
                              className="btn btn-link btn-sm p-0 me-2"
                              style={{ textDecoration: 'underline', fontWeight: 500 }}
                              onClick={() => handleQuizClick(quiz, index + 1 + indexOfFirstQuiz)}
                            >
                              Quiz #{index + 1 + indexOfFirstQuiz}
                            </button>
                            <strong>{quiz.subject}</strong>
                          </td>
                          <td>{quiz.score}/{quiz.totalQuestions}</td>
                          <td className={getScoreColor(quiz.score, quiz.totalQuestions)}>
                            <strong>{Math.round((quiz.score / quiz.totalQuestions) * 100)}%</strong>
                          </td>
                          <td>{formatDate(quiz.completedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <nav aria-label="Quiz history pagination">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, index) => (
                        <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => paginate(index + 1)}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                    <div className="text-center mt-2">
                      <small className="text-muted">
                        Showing {indexOfFirstQuiz + 1} to {Math.min(indexOfLastQuiz, quizHistory.length)} of {quizHistory.length} quizzes
                      </small>
                    </div>
                  </nav>
                )}
              </>
            )}
          </div>
          {/* Performance Line Graph (moved below quiz history) */}
          {quizHistory.length > 0 && (
            <div className="card p-4 shadow-lg mt-4" style={{ borderRadius: 18 }}>
              <h4 className="mb-3" style={{ color: '#6366f1', fontWeight: 700 }}>
                <span role="img" aria-label="trend">📈</span> Performance Trend
              </h4>
              <Line data={performanceData} options={performanceOptions} height={220} />
            </div>
          )}
        </div>
      </div>
      {/* Quiz Details Modal (modern style) */}
      {showQuizModal && selectedQuiz && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.3)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 18 }}>
              <div className="modal-header" style={{ background: '#e0e7ff', borderTopLeftRadius: 18, borderTopRightRadius: 18 }}>
                <h5 className="modal-title">Quiz #{selectedQuiz.index} - {selectedQuiz.subject} Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowQuizModal(false)}></button>
              </div>
              <div className="modal-body">
                {renderQuizDetails(selectedQuiz)}
              </div>
              <div className="modal-footer" style={{ background: '#f8fafc', borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}>
                <button className="btn btn-secondary" onClick={() => setShowQuizModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Quiz history row hover effect */}
      <style>{`
        .quiz-history-row:hover {
          background: #e0e7ff !important;
        }
      `}</style>
    </div>
  );
};

export default Profile;
