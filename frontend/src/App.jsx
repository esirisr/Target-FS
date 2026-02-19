import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import ProDashboard from './pages/ProDashboard';
import ClientHome from './pages/ClientHome';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); 
  
  if (!token) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop /> 
      <div style={styles.appWrapper}>
        <Navbar />
        <main style={styles.mainContent}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* 1. Admin Management */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </ProtectedRoute>
            } />

            {/* 2. Professional Dashboard */}
            <Route path="/pro-dashboard" element={
              <ProtectedRoute allowedRoles={['pro']}>
                <ProDashboard />
              </ProtectedRoute>
            } />

            {/* 3. Client Marketplace 
                UPDATE: Added 'admin' to allowedRoles so you can test visibility
            */}
            <Route path="/client-home" element={
              <ProtectedRoute allowedRoles={['client', 'admin']}>
                <ClientHome />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer style={styles.footer}>
          <p>© 2026 Professional Service Platform. All rights reserved.</p>
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
    fontFamily: "'Inter', sans-serif" 
  },
  mainContent: { 
    flex: 1, 
    width: '100%', 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: '40px 20px', 
    boxSizing: 'border-box' 
  },
  footer: { 
    padding: '30px 20px', 
    textAlign: 'center', 
    color: '#64748b', 
    fontSize: '0.9rem', 
    borderTop: '1px solid #e2e8f0', 
    backgroundColor: '#ffffff' 
  }
};

export default App;
