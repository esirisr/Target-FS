import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import ProDashboard from './pages/ProDashboard';
import ClientHome from './pages/ClientHome';

// Scroll to top on every route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// ProtectedRoute with Smart Redirects
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); 
  
  if (!token) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'pro') return <Navigate to="/pro-dashboard" replace />;
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    if (userRole === 'client') return <Navigate to="/client-home" replace />;
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Smart Home Component: Decides what the user sees at "/"
const SmartHome = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Home />;
  
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'pro') return <Navigate to="/pro-dashboard" replace />;
  return <Navigate to="/client-home" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop /> 
      <div style={styles.appWrapper}>
        <Navbar />
        <main style={styles.mainContent}>
          <Routes>
            <Route path="/" element={<SmartHome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/pro-dashboard" element={
              <ProtectedRoute allowedRoles={['pro']}>
                <ProDashboard />
              </ProtectedRoute>
            } />
            <Route path="/client-home" element={
              <ProtectedRoute allowedRoles={['client', 'admin']}>
                <ClientHome />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer style={styles.footer}>
          <p>© 2026 HOME-MAN Platform. All rights reserved.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  appWrapper: { 
    minHeight: '100vh', 
    display: 'flex', 
    flexDirection: 'column', 
    backgroundColor: '#f8fafc', 
    fontFamily: "'Inter', sans-serif",
    overflowX: 'hidden'
  },
  mainContent: { 
    flex: 1, 
    width: '100%', 
    maxWidth: '1400px',
    margin: '0 auto', 
    padding: '20px', 
    boxSizing: 'border-box' 
  },
  footer: { 
    padding: '40px 20px', 
    textAlign: 'center', 
    color: '#94a3b8', 
    fontSize: '0.85rem', 
    borderTop: '1px solid #e2e8f0', 
    backgroundColor: '#ffffff' 
  }
};

export default App;