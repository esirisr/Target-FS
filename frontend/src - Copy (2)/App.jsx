import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Pro from './pages/Pro';
import Client from './pages/Client';
import AdminAnalytics from "./pages/AdminDashboard";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;

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
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* SHARED ANALYTICS ROUTE */}
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin', 'pro', 'client']}>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Admin />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pro-dashboard"
              element={
                <ProtectedRoute allowedRoles={['pro']}>
                  <Pro />
                </ProtectedRoute>
              }
            />

            <Route
              path="/client-home"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <Client />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer style={styles.footer}>
          © 2026 HOME-MAN Platform. All rights reserved.
        </footer>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  appWrapper: { minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' },
  mainContent: { flex: 1, width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '20px' },
  footer: { padding: '30px', textAlign: 'center', borderTop: '1px solid #e2e8h0' }
};

export default App;