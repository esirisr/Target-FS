import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ProCard from '../components/ProCard';

export default function ClientHome() {
  const [pros, setPros] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await API.get('/admin/dashboard');
      const verifiedPros = (res.data.allPros || []).filter(
        p => p.isVerified && !p.isSuspended
      );
      setPros(verifiedPros);

      const token = localStorage.getItem('token');
      if (token) {
        const bookRes = await API.get('/bookings/my-bookings');
        setRequests(bookRes.data.bookings || []);
      }
    } catch (err) {
      console.error("Error loading marketplace data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={styles.loader}>
        <div className="spinner"></div>
        <p style={styles.loaderText}>Finding the best professionals...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spinner {
            border: 4px solid rgba(0,0,0,0.1);
            border-left-color: #4f46e5;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Decorative background elements */}
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>

      <header style={styles.headerSection}>
        <h2 style={styles.title}>
          <span style={styles.gradientText}>Available Professionals</span>
        </h2>
        <div style={styles.underline}></div>
        <p style={styles.subtitle}>Hand-picked experts ready to help with your next project</p>
      </header>

      <main style={styles.mainContent}>
        <div style={styles.gridWrapper}>
          {pros.length > 0 ? (
            pros.map(p => (
              <div key={p._id} className="pro-card-wrapper">
                <ProCard
                  pro={p}
                  onAction={loadData}
                  userBookings={requests}
                />
              </div>
            ))
          ) : (
            <div style={styles.emptyState}>
              <p>No professionals available in your area yet.</p>
            </div>
          )}
        </div>
      </main>

      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2026 HOME-MAN. Secure • Reliable • Local</p>
      </footer >

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
          animation: float 8s infinite ease-in-out;
        }
        .blob1 {
          top: -100px;
          right: -50px;
          width: 400px;
          height: 400px;
          background: rgba(79, 70, 229, 0.08);
        }
        .blob2 {
          bottom: 10%;
          left: -100px;
          width: 300px;
          height: 300px;
          background: rgba(59, 130, 246, 0.05);
          animation-delay: -2s;
        }
        .pro-card-wrapper {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .pro-card-wrapper:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    position: 'relative',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    overflowX: 'hidden',
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  headerSection: {
    textAlign: 'center',
    padding: '60px 20px 40px',
    zIndex: 1,
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: '900',
    margin: 0,
    color: '#0f172a',
    letterSpacing: '-1px',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #0f172a 0%, #4f46e5 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  underline: {
    width: '60px',
    height: '4px',
    background: '#4f46e5',
    margin: '15px auto',
    borderRadius: '10px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#64748b',
    maxWidth: '500px',
    margin: '0 auto',
  },
  mainContent: {
    flex: 1,
    zIndex: 1,
    padding: '0 20px 80px',
  },
  gridWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '100px 0',
    color: '#94a3b8',
    fontSize: '1.1rem',
  },
  footer: {
    textAlign: 'center',
    padding: '40px 20px',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#fff',
  },
  footerText: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    margin: 0,
    fontWeight: '500',
  },
  loader: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loaderText: {
    fontSize: '1.1rem',
    color: '#475569',
    fontWeight: '600',
  },
};