import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ProCard from '../components/ProCard';

export default function ClientHome() {
  const [pros, setPros] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);

  // notification helper
  const addNotification = (message, type = 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const loadData = async () => {
    try {
      const [res, profile] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/profile')
      ]);

      setUser(profile.data);

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
      console.error("Error loading marketplace:", err);
      addNotification('Failed to load professionals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !user) {
    return (
      <div style={styles.loaderContainer}>
        <div className="loader-spinner"></div>
        <p style={styles.loaderText}>Loading marketplace…</p>
        <style>{`
          .loader-spinner {
            width: 70px;
            height: 70px;
            border: 5px solid rgba(99, 102, 241, 0.1);
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 0.8s ease-in-out infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // LOCATION FILTER
  const userLocation = user.location?.toLowerCase();

  const filteredPros = pros.filter(pro => {
    return (
      pro.location?.toLowerCase() === userLocation &&
      (
        pro.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pro.skills?.some(skill =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  });

  return (
    <div style={styles.page}>

      {/* notifications */}
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

      <div style={styles.container}>

        <header style={styles.hero}>
          <h1 style={styles.title}>
            Find experts in <span style={styles.gradient}>{user.location}</span>
          </h1>
          <p style={styles.subtitle}>
            Professionals from your area only
          </p>

          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              style={styles.searchInput}
              placeholder="Search by name or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <section>
          {filteredPros.length > 0 ? (
            <div style={styles.proGrid}>
              {filteredPros.map(p => (
                <ProCard
                  key={p._id}
                  pro={p}
                  role="client"
                  onAction={loadData}
                  userBookings={requests}
                />
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <p>No professionals available in your area.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

// STYLES
const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  toastContainer: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  notificationItem: {
    padding: '12px 18px',
    background: '#fff',
    borderLeft: '4px solid',
    borderRadius: '8px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.6rem',
    fontWeight: '800',
  },
  gradient: {
    color: '#4f46e5',
  },
  subtitle: {
    color: '#64748b',
  },
  searchWrapper: {
    marginTop: '20px',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: '18px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  searchInput: {
    width: '100%',
    padding: '14px 20px 14px 46px',
    borderRadius: '30px',
    border: '1px solid #cbd5e1',
  },
  proGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
  },
  loaderContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: '16px',
  },
};
