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

  // Toast Notification System
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
      
      // --- SORTING LOGIC: Newest registrations at the top ---
      const sortedPros = (res.data.allPros || []).sort((a, b) => {
        // Extract timestamp from MongoDB _id (first 8 chars)
        const timeA = parseInt(a._id.substring(0, 8), 16);
        const timeB = parseInt(b._id.substring(0, 8), 16);
        return timeB - timeA; // Descending order
      });

      setData({ ...res.data, allPros: sortedPros });
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
        if (!window.confirm("Are you sure? This action is permanent.")) return;
        await deleteUser(id);
        addNotification("Professional deleted", "success");
      }
      loadData(); // Refresh list after action
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
  const pendingCount = data.allPros.filter(p => !p.isVerified && !p.isSuspended).length;

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div className="admin-loader"></div>
        <p style={styles.loaderText}>Accessing Admin Console...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Dynamic Background Blobs */}
      <div style={styles.backgroundBlobs}>
        <div style={styles.blob1}></div>
        <div style={styles.blob2}></div>
        <div style={styles.blob3}></div>
      </div>

      {/* Notification Toasts */}
      <div style={styles.notificationContainer}>
        {notifications.map(n => (
          <div
            key={n.id}
            style={{
              ...styles.notification,
              backgroundColor: n.type === 'success' ? '#10b981' : '#ef4444',
            }}
          >
            {n.type === 'success' ? '✅' : '⚠️'} {n.message}
          </div>
        ))}
      </div>

      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </header>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, borderBottomColor: '#6366f1'}}>
            <span style={styles.statIcon}>👥</span>
            <div>
              <p style={styles.statLabel}>Total Network</p>
              <p style={styles.statValue}>{totalPros}</p>
            </div>
          </div>
          <div style={{...styles.statCard, borderBottomColor: '#10b981'}}>
            <span style={styles.statIcon}>🛡️</span>
            <div>
              <p style={styles.statLabel}>Verified Pros</p>
              <p style={styles.statValue}>{verifiedCount}</p>
            </div>
          </div>
          <div style={{
            ...styles.statCard, 
            borderBottomColor: '#f59e0b',
            background: pendingCount > 0 ? '#fffbeb' : '#fff' 
          }}>
            <span style={styles.statIcon}>⏳</span>
            <div>
              <p style={styles.statLabel}>Awaiting Verification</p>
              <p style={styles.statValue}>{pendingCount}</p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
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
              <p style={styles.emptyText}>No matches found</p>
              <button onClick={() => setSearchTerm('')} style={styles.clearBtn}>Clear Search</button>
            </div>
          )}
        </section>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes slideIn {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .admin-loader {
          width: 60px;
          height: 60px;
          border: 5px solid #f1f5f9;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    position: 'relative',
    minHeight: '100vh',
    background: '#f8fafc',
    overflowX: 'hidden',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 20px',
    position: 'relative',
    zIndex: 2,
  },
  backgroundBlobs: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
  },
  blob1: {
    position: 'absolute',
    top: '-10%',
    left: '-5%',
    width: '40%',
    height: '40%',
    background: 'rgba(99, 102, 241, 0.08)',
    filter: 'blur(100px)',
    borderRadius: '50%',
    animation: 'float 10s infinite alternate',
  },
  blob2: {
    position: 'absolute',
    bottom: '0',
    right: '-5%',
    width: '30%',
    height: '40%',
    background: 'rgba(236, 72, 153, 0.05)',
    filter: 'blur(100px)',
    borderRadius: '50%',
  },
  header: { textAlign: 'center', marginBottom: '60px' },
  title: { fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '20px' },
  gradient: {
    background: 'linear-gradient(90deg, #6366f1, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  searchWrapper: { position: 'relative', maxWidth: '500px', margin: '0 auto' },
  searchIcon: { position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 },
  searchInput: {
    width: '100%',
    padding: '16px 20px 16px 50px',
    borderRadius: '100px',
    border: '1px solid #e2e8f0',
    fontSize: '1rem',
    outline: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '50px',
  },
  statCard: {
    background: '#fff',
    padding: '24px',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
    borderBottom: '4px solid #6366f1',
    transition: 'transform 0.3s ease',
  },
  statIcon: { fontSize: '32px' },
  statLabel: { margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: '600' },
  statValue: { margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' },
  proGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  emptyState: { textAlign: 'center', padding: '100px 0' },
  emptyIcon: { fontSize: '50px', display: 'block', marginBottom: '20px' },
  emptyText: { color: '#64748b', fontSize: '1.2rem', fontWeight: '500' },
  clearBtn: {
    marginTop: '15px',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
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
    padding: '16px 24px',
    borderRadius: '16px',
    color: '#fff',
    fontWeight: '700',
    fontSize: '0.9rem',
    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)',
    animation: 'slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  loaderContainer: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' },
};