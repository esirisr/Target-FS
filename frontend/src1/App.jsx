import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import ProDashboard from './pages/ProDashboard';
import ClientHome from './pages/ClientHome';

// ==================== TOAST SYSTEM ====================
const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);
  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => (
  <div style={toastStyles.container}>
    {toasts.map(t => (
      <div key={t.id} style={{ ...toastStyles.toast, ...toastStyles[t.type] }} onClick={() => removeToast(t.id)}>
        <span>{t.message}</span>
      </div>
    ))}
  </div>
);

// ==================== PROTECTION & ROUTING ====================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" replace />;
  return children;
};

const SmartHome = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token) return <Home />;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'pro') return <Navigate to="/pro-dashboard" replace />;
  return <Navigate to="/client-home" replace />;
};

// ==================== STICKY COMPONENTS ====================

const Footer = () => (
  <footer style={styles.footer}>
    <div style={styles.footerInner}>
      <h4 style={styles.footerBrand}>Target Solution Team</h4>
      <p style={styles.footerCopy}>© 2026 HOME-MAN</p>
    </div>
  </footer>
);

const AnimatedBackground = () => (
  <div style={styles.background}>
    <div style={styles.orb1} /><div style={styles.orb2} /><div style={styles.orb3} />
    <div style={styles.gradientOverlay} />
  </div>
);

// ==================== MAIN APP ====================

const BAR_HEIGHT = '65px'; // Height for both Navbar and Footer

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AnimatedBackground />
        <div style={styles.appWrapper}>
          
          {/* STICKY TOP NAVBAR */}
          <header style={styles.stickyHeader}>
            <Navbar />
          </header>

          {/* SCROLLABLE MAIN CONTENT */}
          <main style={styles.mainContent}>
            <Routes>
              <Route path="/" element={<SmartHome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
              <Route path="/pro-dashboard" element={<ProtectedRoute allowedRoles={['pro']}><ProDashboard /></ProtectedRoute>} />
              <Route path="/client-home" element={<ProtectedRoute allowedRoles={['client', 'admin']}><ClientHome /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* STICKY BOTTOM FOOTER */}
          <Footer />

        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

// ==================== STYLES ====================

const styles = {
  appWrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    position: 'relative',
  },
  stickyHeader: {
    position: 'fixed', // Changed to fixed for total stability
    top: 0,
    left: 0,
    width: '100%',
    height: BAR_HEIGHT,
    zIndex: 2000,
  },
  mainContent: {
    flex: 1,
    paddingTop: BAR_HEIGHT,    // Offset for sticky header
    paddingBottom: BAR_HEIGHT, // Offset for sticky footer
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
    boxSizing: 'border-box',
    zIndex: 1,
  },
  footer: {
    position: 'fixed', // Fixed to bottom of viewport
    bottom: 0,
    left: 0,
    width: '100%',
    height: BAR_HEIGHT,
    backgroundColor: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTop: '1px solid #1e293b',
    zIndex: 2000,
  },
  footerInner: {
    width: '100%',
    maxWidth: '1200px',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerBrand: {
    color: '#3b82f6',
    margin: 0,
    fontSize: '1rem',
    fontWeight: '800',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  footerCopy: {
    color: '#64748b',
    margin: 0,
    fontSize: '0.8rem',
  },
  background: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, overflow: 'hidden' },
  orb1: { position: 'absolute', width: '40vmax', height: '40vmax', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', top: '-10%', right: '-10%' },
  orb2: { position: 'absolute', width: '50vmin', height: '50vmin', borderRadius: '50%', background: 'rgba(16,185,129,0.05)', bottom: '5%', left: '-5%' },
  orb3: { position: 'absolute', width: '30vmin', height: '30vmin', borderRadius: '50%', background: 'rgba(245,158,11,0.05)', top: '40%', left: '60%' },
  gradientOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#f8fafc' },
};

const toastStyles = {
  container: { position: 'fixed', top: '80px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' },
  toast: { padding: '12px 24px', borderRadius: '8px', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer', fontWeight: '500' },
  success: { borderLeft: '4px solid #10b981', color: '#065f46' },
  error: { borderLeft: '4px solid #ef4444', color: '#991b1b' },
};

// Global CSS reset for scrolling
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f8fafc; font-family: 'Inter', sans-serif; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  `;
  document.head.appendChild(style);
}

export default App;