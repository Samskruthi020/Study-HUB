import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as faceapi from 'face-api.js';

const SubjectQuiz = () => {
  const { subject } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('pending'); // 'pending', 'granted', 'denied'
  const [showPermissionModal, setShowPermissionModal] = useState(true);
  const [videoStream, setVideoStream] = useState(null);
  const videoRef = useRef(null);
  const [faceStatus, setFaceStatus] = useState('pending'); // 'pending', 'ok', 'none', 'multiple', 'error'
  const [faceWarning, setFaceWarning] = useState('');
  const [userAnswers, setUserAnswers] = useState([]);
  const [violationCount, setViolationCount] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [streakInfo, setStreakInfo] = useState(null);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Request camera permission and start video stream
  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 200 },
          height: { ideal: 150 },
          facingMode: 'user'
        }, 
        audio: false 
      });
      
      console.log('Camera stream obtained:', stream);
      setVideoStream(stream);
      setCameraPermission('granted');
      setShowPermissionModal(false);
      
      // Set video stream after state updates
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(console.error);
          };
        }
      }, 100);
      
    } catch (error) {
      console.error('Camera permission denied:', error);
      setCameraPermission('denied');
    }
  };

  // Effect to handle video stream when component updates
  useEffect(() => {
    if (videoStream && videoRef.current && cameraPermission === 'granted') {
      videoRef.current.srcObject = videoStream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(console.error);
      };
    }
  }, [videoStream, cameraPermission]);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      } catch (err) {
        console.error('Error loading face-api.js models:', err);
        setFaceStatus('error');
      }
    };
    loadModels();
  }, []);

  // Face detection loop
  useEffect(() => {
    let interval = null;
    const detectFace = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        try {
          const detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          );
          if (detections.length === 1) {
            setFaceStatus('ok');
            setFaceWarning('');
          } else if (detections.length === 0) {
            setFaceStatus('none');
            setFaceWarning('No face detected! Please stay in front of the camera.');
          } else if (detections.length > 1) {
            setFaceStatus('multiple');
            setFaceWarning('Multiple faces detected! Only one person should be present.');
          }
        } catch (err) {
          setFaceStatus('error');
          setFaceWarning('Face detection error.');
        }
      }
    };
    if (cameraPermission === 'granted' && videoStream) {
      interval = setInterval(detectFace, 1200);
    }
    return () => clearInterval(interval);
  }, [cameraPermission, videoStream]);

  // Stop video stream
  const stopVideoStream = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Clean up video stream on component unmount
  useEffect(() => {
    return () => {
      stopVideoStream();
    };
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0 && !showResult) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            // Time's up - auto submit
            finishQuiz();
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 || showResult) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, showResult]);

  // Reset userAnswers on quiz reset
  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
    setLoading(true);
    setTimeLeft(20 * 60);
    setTimerActive(false);
    setShowPermissionModal(true);
    setCameraPermission('pending');
    stopVideoStream();
    setUserAnswers([]);
    // Refetch questions to get new shuffled set
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`http://localhost:5001/quiz/${subject}`);
        if (!res.ok) {
          throw new Error(`Quiz not found for subject: ${subject}`);
        }
        const data = await res.json();
        setQuestions(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz:', error.message);
        setQuestions([]);
        setLoading(false);
      }
    };
    fetchQuiz();
  };

  // Fetch quiz questions on subject change
  useEffect(() => {
const fetchQuiz = async () => {
  try {
    const res = await fetch(`http://localhost:5001/quiz/${subject}`);
    if (!res.ok) {
      throw new Error(`Quiz not found for subject: ${subject}`);
    }
    const data = await res.json();
    setQuestions(data); // ✅ Corrected line
    setLoading(false);  // ✅ To stop loading spinner
  } catch (error) {
    console.error('Error fetching quiz:', error.message);
    setQuestions([]); // ✅ Corrected fallback
    setLoading(false); // ✅
  }
};

    fetchQuiz();
  }, [subject]);

  // Start timer when quiz begins
  useEffect(() => {
    if (questions.length > 0 && !timerActive && !showResult && cameraPermission === 'granted') {
      setTimerActive(true);
    }
  }, [questions, timerActive, showResult, cameraPermission]);

  // Prepare correct answers array
  const getCorrectAnswers = () => questions.map(q => q.answer);

  // Save quiz result to user profile
  const saveQuizResult = async (finalScore, totalQuestions) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    setSaving(true);
    try {
      console.log('Saving quiz result:', { subject, score: finalScore, totalQuestions });
      const response = await axios.post('/quiz/save-result', {
        subject,
        score: finalScore,
        totalQuestions,
        questions: questions.map(q => q.question),
        userAnswers: userAnswers,
        correctAnswers: getCorrectAnswers(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Quiz result saved successfully');
      
      // Get updated streak information
      if (response.data.streak) {
        setStreakInfo(response.data.streak);
      }
    } catch (error) {
      console.error('Error saving quiz result:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 401) {
        console.log('Authentication failed, token may be invalid');
      }
    } finally {
      setSaving(false);
    }
  };

  // Finish quiz function (for both manual finish and auto-submit)
  const finishQuiz = () => {
    let finalScore = score;
    
    // If user has selected an option for current question, count it
    if (selectedOption && selectedOption === questions[currentIndex]?.answer) {
      finalScore = score + 1;
      setScore(finalScore);
    }
    
    setTimerActive(false);
    stopVideoStream(); // Stop video monitoring when quiz ends
    saveQuizResult(finalScore, questions.length);
    setShowResult(true);
  };

  const handleNext = () => {
    let newScore = score;
    if (selectedOption === questions[currentIndex].answer) {
      newScore = score + 1;
      setScore(newScore);
    }
    setUserAnswers(prev => [...prev, selectedOption]);

    setSelectedOption(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishQuiz();
    }
  };

  // Active window/tab detection
  useEffect(() => {
    if (!showResult && cameraPermission === 'granted') {
      const handleViolation = () => {
        setViolationCount((v) => v + 1);
      };
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) handleViolation();
      });
      window.addEventListener('blur', handleViolation);
      document.addEventListener('copy', handleViolation);
      document.addEventListener('cut', handleViolation);
      document.addEventListener('paste', handleViolation);
      return () => {
        document.removeEventListener('visibilitychange', () => {
          if (document.hidden) handleViolation();
        });
        window.removeEventListener('blur', handleViolation);
        document.removeEventListener('copy', handleViolation);
        document.removeEventListener('cut', handleViolation);
        document.removeEventListener('paste', handleViolation);
      };
    }
  }, [showResult, cameraPermission]);

  // Always show warning if there are violations
  useEffect(() => {
    setShowViolationWarning(violationCount > 0);
  }, [violationCount]);

  // Block copy/paste
  useEffect(() => {
    if (!showResult && cameraPermission === 'granted') {
      const blockEvent = (e) => {
        e.preventDefault();
        setViolationCount((v) => v + 1);
        setShowViolationWarning(true);
      };
      document.addEventListener('copy', blockEvent);
      document.addEventListener('cut', blockEvent);
      document.addEventListener('paste', blockEvent);
      return () => {
        document.removeEventListener('copy', blockEvent);
        document.removeEventListener('cut', blockEvent);
        document.removeEventListener('paste', blockEvent);
      };
    }
  }, [showResult, cameraPermission]);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!questions.length) return <div className="text-center mt-5 text-danger">No quiz questions found for <b>{subject}</b>.</div>;

  // Camera Permission Modal
  if (showPermissionModal) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow">
              <div className="card-header bg-warning text-dark">
                <h4 className="mb-0">🎥 Quiz Monitoring System</h4>
              </div>
              <div className="card-body">
                <div className="alert alert-info">
                  <h5>📋 Anti-Malpractice Measures</h5>
                  <p className="mb-2">To ensure fair assessment, this quiz requires video monitoring:</p>
                  <ul className="mb-3">
                    <li>Your camera will be activated during the quiz</li>
                    <li>A small video preview will be visible to you</li>
                    <li>This helps maintain academic integrity</li>
                    <li>No video is recorded or stored</li>
                  </ul>
                </div>
                
                {cameraPermission === 'pending' && (
                  <div className="text-center">
                    <p><strong>Please grant camera permission to proceed with the quiz.</strong></p>
                    <button 
                      className="btn btn-success btn-lg me-3"
                      onClick={requestCameraPermission}
                    >
                      Allow Camera & Start Quiz
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => window.location.href = '/Quiz'}
                    >
                      Cancel
                    </button>
                  </div>
                )}
                
                {cameraPermission === 'denied' && (
                  <div className="alert alert-danger text-center">
                    <h5>❌ Camera Permission Required</h5>
                    <p>Camera access is required to take this quiz. Please:</p>
                    <ol className="text-start">
                      <li>Click the camera icon in your browser's address bar</li>
                      <li>Select "Allow" for camera permission</li>
                      <li>Refresh the page and try again</li>
                    </ol>
                    <button 
                      className="btn btn-warning me-2"
                      onClick={() => window.location.reload()}
                    >
                      Refresh Page
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => window.location.href = '/Quiz'}
                    >
                      Go Back
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">{subject} Quiz</h2>
      
      {/* Video Monitoring Display */}
      {cameraPermission === 'granted' && videoStream && (
        <div className="position-fixed" style={{ top: 20, right: 20, zIndex: 1000 }}>
          <div className="card shadow-sm" style={{ width: 200 }}>
            <div className="card-header bg-dark text-white text-center py-1">
              <small>🎥 Monitoring Active</small>
            </div>
            <div style={{ position: 'relative', height: 150, backgroundColor: '#000' }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  backgroundColor: '#000'
                }}
                onError={(e) => console.error('Video error:', e)}
                onLoadStart={() => console.log('Video loading started')}
                onCanPlay={() => console.log('Video can play')}
              />
              {!videoStream && (
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 12
                  }}
                >
                  Loading camera...
                </div>
              )}
            </div>
            {/* Face detection warning */}
            {faceWarning && (
              <div className="alert alert-danger m-2 p-2 text-center" style={{ fontSize: 12 }}>
                {faceWarning}
              </div>
            )}
            {/* Debug info - remove in production */}
            <div className="card-footer p-1" style={{ fontSize: 10 }}>
              <div>Stream: {videoStream ? '✅' : '❌'}</div>
              <div>Ref: {videoRef.current ? '✅' : '❌'}</div>
              <button 
                className="btn btn-sm btn-outline-secondary mt-1"
                style={{ fontSize: 10, padding: '2px 6px' }}
                onClick={() => {
                  console.log('Debug info:', {
                    videoStream,
                    videoRef: videoRef.current,
                    srcObject: videoRef.current?.srcObject,
                    videoTracks: videoStream?.getVideoTracks()
                  });
                  if (videoRef.current && videoStream) {
                    videoRef.current.srcObject = videoStream;
                    videoRef.current.play().catch(console.error);
                  }
                }}
              >
                Debug
              </button>
            </div>
          </div>
        </div>
      )}

      {!showResult && (
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="text-center">
              <span className="badge bg-primary fs-6">Question {currentIndex + 1} of {questions.length}</span>
            </div>
          </div>
          <div className="col-md-6">
            <div className="text-center">
              <span className={`badge fs-6 ${timeLeft <= 60 ? 'bg-danger' : timeLeft <= 300 ? 'bg-warning' : 'bg-success'}`}>
                ⏰ Time Left: {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <div className="col-12 mt-2">
            {showViolationWarning && (
              <div className="alert alert-danger text-center p-2 mb-0">
                <b>Warning:</b> Please stay on the quiz page and do not copy/paste!<br/>
                Violations: {violationCount} / 3
                {violationCount >= 3 && <div className="mt-1">Quiz auto-submitted due to repeated violations.</div>}
              </div>
            )}
          </div>
        </div>
      )}

      {!showResult ? (
        <div className="card p-4 shadow-sm">
          <h5>{currentIndex + 1}. {questions[currentIndex].question}</h5>
         <div className="mt-3 d-flex flex-column">
  {questions[currentIndex].options.map((option, idx) => (
    <button
      key={idx}
      className={`btn btn-outline-primary mb-2 text-start ${selectedOption === option ? 'active' : ''}`}
      onClick={() => setSelectedOption(option)}
    >
      <strong>{String.fromCharCode(65 + idx)}.</strong> {option}
    </button>
  ))}
</div>

          <div className="mt-3 d-flex justify-content-between">
            <button
              className="btn btn-warning"
              onClick={finishQuiz}
            >
              Finish Test
            </button>
            <button
              className="btn btn-success"
              onClick={handleNext}
              disabled={selectedOption === null}
            >
              {currentIndex + 1 === questions.length ? 'Submit Answer' : 'Next Question'}
            </button>
          </div>
        </div>
      ) : (
        <div className="alert alert-success text-center">
          <h4>🎉 You completed the quiz!</h4>
          <p>Your Score: <strong>{score} / {questions.length}</strong></p>
          <p>Percentage: <strong>{Math.round((score / questions.length) * 100)}%</strong></p>
          <p>Time Used: <strong>{formatTime(20 * 60 - timeLeft)}</strong></p>
          {saving && <p className="text-muted">Saving result...</p>}
          
          {/* Streak Information */}
          {streakInfo && (
            <div className="mt-3 p-3 d-inline-flex align-items-center" style={{ background: '#fff5f0', borderRadius: '9999px', border: '2px solid #ff6b35' }}>
              <span className="h4 mb-0 me-2" style={{ color: '#ff6b35' }}>
                {'🔥'.repeat(Math.min(streakInfo.current, 10))}
              </span>
              <span className="h3 mb-0" style={{ color: '#ff6b35', fontWeight: 700 }}>
                {streakInfo.current}
              </span>
            </div>
          )}
          
          <div className="mt-3">
            <button 
              className="btn btn-success me-2" 
              onClick={resetQuiz}
            >
              Retake {subject} Quiz
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.href = '/Quiz'}
            >
              Take Another Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectQuiz;
