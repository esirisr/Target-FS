import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ProCard from '../components/ProCard';

export default function ClientHome() {
  const [pros, setPros] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);

  // Internal notification helper – now renders as toasts
  const addNotification = (message, type = 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

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
      addNotification('Failed to load professionals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPros = pros.filter(pro =>
    pro.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pro.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
    pro.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div className="marketplace-loader"></div>
        <p style={styles.loaderText}>Discovering top professionals…</p>
        <style>{`
          .marketplace-loader {
            width: 80px;
            height: 80px;
            border: 6px solid rgba(99, 102, 241, 0.1);
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: market-spin 1s ease-in-out infinite;
            box-shadow: 0 15px 30px -10px rgba(99, 102, 241, 0.3);
          }
          @keyframes market-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Fixed toast container for normal notifications */}
      {notifications.length > 0 && (
        <div style={styles.toastContainer}>
          {notifications.map(n => (
            <div
              key={n.id}
              style={{
                ...styles.notificationItem,
                borderLeftColor: n.type === 'success' ? '#22c55e' : '#ef4444',
              }}
            >
              {n.message}
            </div>
          ))}
        </div>
      )}

      <div style={styles.backgroundBlobs}>
        <div style={styles.blob1}></div>
        <div style={styles.blob2}></div>
        <div style={styles.blob3}></div>
      </div>

      <div style={styles.container}>
        <header style={styles.hero}>
          <h1 style={styles.title}>
            Find your <span style={styles.gradient}>perfect expert</span>
          </h1>
          <p style={styles.subtitle}>
            Browse verified professionals and hire the best talent for your project
          </p>

          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search by name, skill, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </header>

        <section>
          {filteredPros.length > 0 ? (
            <div style={styles.proGrid}>
              {filteredPros.map(p => (
                <div key={p._id} style={styles.cardWrapper}>
                  <ProCard
                    pro={p}
                    onAction={loadData}
                    userBookings={requests}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🔎</span>
              <p style={styles.emptyText}>No professionals match your search</p>
              <p style={styles.emptySubtext}>Try different keywords or clear the filter</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Styles (updated for toast notifications)
const styles = {
  page: {
    position: 'relative',
    minHeight: '100vh',
    background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '40px 24px 80px',
    position: 'relative',
    zIndex: 2,
  },
  // New fixed toast container
  toastContainer: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxWidth: '350px',
  },
  notificationItem: {
    padding: '12px 18px',
    borderRadius: '8px',
    background: '#fff',
    borderLeft: '4px solid',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
    fontSize: '0.95rem',
    color: '#1e293b',
    animation: 'slideIn 0.2s ease',
  },
  backgroundBlobs: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    zIndex: 0,
  },
  blob1: {
    position: 'absolute',
    top: '-120px',
    right: '-80px',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0) 70%)',
    filter: 'blur(80px)',
    animation: 'float 20s ease-in-out infinite',
  },
  blob2: {
    position: 'absolute',
    bottom: '-150px',
    left: '-100px',
    width: '550px',
    height: '550px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(236,72,153,0) 70%)',
    filter: 'blur(90px)',
    animation: 'float 24s ease-in-out infinite reverse',
  },
  blob3: {
    position: 'absolute',
    top: '40%',
    left: '55%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0) 70%)',
    filter: 'blur(70px)',
    animation: 'pulse-glow 10s ease-in-out infinite',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
    fontWeight: '900',
    margin: '0 0 16px',
    color: '#0f172a',
    lineHeight: 1.2,
  },
  gradient: {
    background: 'linear-gradient(135deg, #4f46e5, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#475569',
    maxWidth: '600px',
    margin: '0 auto 36px',
  },
  searchWrapper: {
    maxWidth: '600px',
    margin: '0 auto',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.3rem',
    opacity: 0.6,
  },
  searchInput: {
    width: '100%',
    padding: '18px 24px 18px 58px',
    fontSize: '1.1rem',
    borderRadius: '60px',
    border: '2px solid rgba(226,232,240,0.6)',
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 15px 30px -12px rgba(0,0,0,0.1)',
  },
  proGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '28px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'rgba(255,255,255,0.6)',
    backdropFilter: 'blur(8px)',
    borderRadius: '48px',
    border: '1px solid rgba(226,232,240,0.6)',
  },
  emptyIcon: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '20px',
    opacity: 0.6,
  },
  emptyText: {
    fontSize: '1.4rem',
    fontWeight: '600',
    color: '#334155',
    margin: '0 0 8px',
  },
  emptySubtext: {
    fontSize: '1rem',
    color: '#64748b',
    margin: 0,
  },
  loaderContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)',
  },
  loaderText: {
    marginTop: '24px',
    fontSize: '1.2rem',
    color: '#1e293b',
    fontWeight: '500',
  },
};

// Add animation keyframes (optional, can be added in global CSS or style tag)
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
`;
document.head.appendChild(styleSheet);