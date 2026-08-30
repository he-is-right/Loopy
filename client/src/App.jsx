import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Feedback from './pages/Feedback';
import PaymentCallback from './pages/PaymentCallback';
import LandingPage from './pages/LandingPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFullUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.loggedIn) {
        setUser(data);
      }
      return data;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    fetchFullUser().finally(() => setLoading(false));
  }, []);

  // After login/signup, re-fetch full user data from /api/auth/me
  const handleAuth = async () => {
    await fetchFullUser();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<LandingPage user={user} />} 
        />
        <Route 
          path="/login" 
          element={!user ? <Auth isLogin={true} onAuth={handleAuth} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/signup" 
          element={!user ? <Auth isLogin={false} onAuth={handleAuth} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" />} 
        />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/f/:slug" element={<Feedback />} />
      </Routes>
    </Router>
  );
}

export default App;
