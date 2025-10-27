import React from 'react';
import { BrowserRouter as Router, Routes, Route ,Navigate} from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import Register from './components/Register';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute'; // ✅ import it
import Dashboard from './components/Dashboard';
import DSA from './pages/DSA';
import OS from './pages/OS';
import CN from './pages/CN';
import DBMS from './pages/DBMS';
import Java from './pages/Java';
import Python from './pages/Python';
import WebDev from './pages/WebDev';
import SE from './pages/SE';
import ML from './pages/ML';
import Resources from './components/Resources';
import Notes from './pages/Notes';
import SubjectNotePad from './pages/SubjectNotePad';
import Profile from './components/Profile';
import SubjectQuiz from './pages/SubjectQuiz'; // or correct path
import QuizPage from './pages/QuizPage';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import AIPredictor from './pages/AIPredictor';
import Chatbot from './components/Chatbot';
import CodeEditor from './components/CodeEditor';
import { useState, useEffect } from 'react';
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [showChatPopup, setShowChatPopup] = useState(false);

  // Listen for auth changes (login/logout)
  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  // Disable initial chatbot promo popup per user request
  useEffect(() => {
    setShowChatPopup(false);
    sessionStorage.removeItem('chatPopupShown');
  }, [isAuthenticated]);
  return (
    <div className="d-flex flex-column min-vh-100">
      <Router>
        <Header />
        
        <div className="flex-grow-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
     <Route
      path="/dashboard"
       element={
       <ProtectedRoute>
        <Dashboard />
       </ProtectedRoute>
        }
            />
        <Route path="/dsa" element={<DSA />} />
        <Route path="/os" element={<OS />} />
        <Route path="/cn" element={<CN />} />
        <Route path="/dbms" element={<DBMS />} />
        <Route path="/java" element={<Java />} />
        <Route path="/python" element={<Python />} />
        <Route path="/web-dev" element={<WebDev />} />
        <Route path="/se" element={<SE />} />
        <Route path="/ml" element={<ML />} />
        <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
        <Route path="/notes/:subject" element={<ProtectedRoute><SubjectNotePad /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
         <Route path="/Quiz" element={<QuizPage />} />
         <Route path="/quiz/:subject" element={<SubjectQuiz />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/ai-predictor" element={<AIPredictor />} />
        <Route path="/faq" element={<FAQ />} /> 
        <Route path="/code-editor" element={<CodeEditor />} />
          </Routes>
        </div>
        
        <Footer />
        {isAuthenticated && <Chatbot />}
        {/* Chat helper popup removed as requested */}
      </Router>
    </div>
  );
};

export default App;