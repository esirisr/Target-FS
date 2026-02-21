import React, { useState, useEffect } from 'react';
import {
  fetchDashboard,
  verifyPro,
  suspendPro,
  deleteUser
} from '../services/api';
import AdminCard from '../components/AdminCard';

export default function Admin() {
  const [data, setData] = useState({ allPros: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const loadData = async () => {
    try {
      const res = await fetchDashboard();
      setData(res.data);
    } catch (err) {
      console.error("Admin Load Error:", err);
      addNotification("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id, type) => {
    try {
      if (type === 'verify') {
        await verifyPro(id);
        addNotification("Professional verified successfully", "success");
      } 
      else if (type === 'suspend') {
        await suspendPro(id);
        addNotification("Professional suspended", "success");
      } 
      else if (type === 'delete') {
        await deleteUser(id);
        addNotification("Professional deleted", "success");
      }

      loadData();
    } catch (err) {
      addNotification(err.response?.data?.message || "Action failed!");
    }
  };

  const filteredPros = data.allPros.filter(pro =>
    pro.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pro.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pro.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPros = data.allPros.length;
  const verifiedCount = data.allPros.filter(p => p.isVerified).length;
  const suspendedCount = data.allPros.filter(p => p.isSuspended).length;
  const pendingCount = data.allPros.filter(p => !p.isVerified && !p.isSuspended).length;

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div className="admin-loader"></div>
        <p style={styles.loaderText}>Loading Management Console…</p>
        <style>{`
          .admin-loader {
            width: 80px;
            height: 80px;
            border: 6px solid rgba(99, 102, 241, 0.1);
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: admin-spin 1s ease-in-out infinite;
            box-shadow: 0 15px 30px -10px rgba(99, 102, 241, 0.3);
          }
          @keyframes admin-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.backgroundBlobs}>
        <div style={styles.blob1}></div>
        <div style={styles.blob2}></div>
        <div style={styles.blob3}></div>
      </div>

      <div style={styles.notificationContainer}>
        {notifications.map(n => (
          <div
            key={n.id}
            style={{
              ...styles.notification,
              backgroundColor: n.type === 'success' ? '#22c55e' : '#ef4444',
            }}
          >
            {n.message}
          </div>
        ))}
      </div>

      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>
            Management <span style={styles.gradient}>Console</span>
          </h1>

          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </header>

        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, borderBottomColor: '#6366f1'}}>
            <span style={styles.statIcon}>📊</span>
            <div>
              <p style={styles.statLabel}>Total Professionals</p>
              <p style={styles.statValue}>{totalPros}</p>
            </div>
          </div>
          <div style={{...styles.statCard, borderBottomColor: '#22c55e'}}>
            <span style={styles.statIcon}>✅</span>
            <div>
              <p style={styles.statLabel}>Verified</p>
              <p style={styles.statValue}>{verifiedCount}</p>
            </div>
          </div>
          <div style={{...styles.statCard, borderBottomColor: '#f59e0b'}}>
            <span style={styles.statIcon}>⏳</span>
            <div>
              <p style={styles.statLabel}>Pending Review</p>
              <p style={styles.statValue}>{pendingCount}</p>
            </div>
          </div>
        </div>

        <section>
          {filteredPros.length > 0 ? (
            <div style={styles.proGrid}>
              {filteredPros.map(pro => (
                <div key={pro._id} style={styles.cardWrapper}>
                  <AdminCard pro={pro} onAction={handleAction} />
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

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    position: 'relative',
    minHeight: '100vh',
    background: 'linear-gradient(145deg, #f1f5f9 0%, #f8fafc 100%)',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '40px 24px 80px',
    position: 'relative',
    zIndex: 2,
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
    left: '-80px',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0) 70%)',
    filter: 'blur(80px)',
    animation: 'float 18s ease-in-out infinite',
  },
  blob2: {
    position: 'absolute',
    bottom: '-150px',
    right: '-100px',
    width: '550px',
    height: '550px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(236,72,153,0) 70%)',
    filter: 'blur(90px)',
    animation: 'float 22s ease-in-out infinite reverse',
  },
  blob3: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0) 70%)',
    filter: 'blur(70px)',
    animation: 'pulse-glow 12s ease-in-out infinite',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    position: 'relative',
  },
  title: {
    fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
    fontWeight: '900',
    margin: '0 0 16px',
    color: '#0f172a',
  },
  gradient: {
    background: 'linear-gradient(135deg, #4f46e5, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
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
    zIndex: 1,
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
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    background: '#ffffff',
    borderRadius: '28px',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    borderBottom: '4px solid',
    boxShadow: '0 15px 30px -12px rgba(0,0,0,0.1)',
  },
  statIcon: {
    fontSize: '2.2rem',
  },
  statLabel: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '500',
  },
  statValue: {
    margin: '4px 0 0',
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
  },
  proGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '28px',
  },
  cardWrapper: {
    width: '100%',
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
    marginBottom: '20px',
    opacity: 0.6,
  },
  emptyText: {
    fontSize: '1.4rem',
    fontWeight: '600',
    color: '#334155',
  },
  emptySubtext: {
    fontSize: '1rem',
    color: '#64748b',
  },
  loaderContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(145deg, #f1f5f9, #f8fafc)',
  },
  loaderText: {
    marginTop: '24px',
    fontSize: '1.2rem',
    color: '#1e293b',
    fontWeight: '500',
  },
  notificationContainer: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  notification: {
    padding: '12px 24px',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '500',
    boxShadow: '0 10px 20px -8px rgba(0,0,0,0.2)',
    animation: 'slideIn 0.3s ease',
  },
};