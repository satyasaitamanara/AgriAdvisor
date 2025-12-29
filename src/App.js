import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Landing from './components/Landing';
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import CropRecommendation from './components/CropRecommendation/CropRecommendation';
import SoilAdvisory from './components/SoilAdvisory/SoilAdvisory';
import PestDetector from './components/PestDetector/PestDetector';
import Weather from './components/Weather/Weather';
import Market from './components/Market/Market';
import History from './components/History/History';
import KrishiMitraChatbot from './components/Chatbot/KrishiMitraChatbot';
import ChatbotToggle from './components/Chatbot/ChatbotToggle';

const ChatbotWrapper = ({ children }) => {
  const [showChatbot, setShowChatbot] = useState(false);
  const location = useLocation();

  // Don't show chatbot on auth pages
  const shouldShowChatbot = !['/', '/signup', '/login'].includes(location.pathname);

  return (
    <>
      {children}
      {shouldShowChatbot && (
        <>
          <ChatbotToggle 
            onClick={() => setShowChatbot(!showChatbot)} 
            isOpen={showChatbot} 
          />
          {showChatbot && (
            <KrishiMitraChatbot onClose={() => setShowChatbot(false)} />
          )}
        </>
      )}
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ChatbotWrapper>
              <Dashboard />
            </ChatbotWrapper>
          } />
          {/* Add similar wrapper for other routes that need chatbot */}
          <Route path="/recommend" element={<CropRecommendation />} />
          <Route path="/soil" element={<SoilAdvisory />} />
          <Route path="/pest" element={<PestDetector />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/market" element={<Market />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;