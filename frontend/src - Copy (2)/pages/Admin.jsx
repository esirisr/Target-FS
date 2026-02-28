import React, { useState, useEffect } from 'react';
import { fetchDashboard, verifyPro, suspendPro, deleteUser } from '../services/api';
import AdminCard from '../components/AdminCard';

export default function Admin() {
  const [data, setData] = useState({ allPros: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);

  /* =========================
      LOAD DASHBOARD DATA
  ========================== */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchDashboard();
      const sortedPros = (res.data.allPros || []).sort((a, b) => {
        const timeA = parseInt(a._id.substring(0, 8), 16);
        const timeB = parseInt(b._id.substring(0, 8), 16);
        return timeB - timeA;
      });

      setData({
        stats: res.data.stats || {},
        allPros: sortedPros
      });
    } catch (err) {
      if (err.response?.status === 401) {
        addNotification("Session expired. Please login again.");
      } else {
        addNotification("Failed to load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      ACTION HANDLER
  ========================== */
  const handleAction = async (id, type) => {
    try {
      if (type === 'verify') await verifyPro(id);
      if (type === 'suspend') await suspendPro(id);
      if (type === 'delete') {
        const confirmDelete = window.confirm("This will permanently delete the user. Continue?");
        if (!confirmDelete) return;
        await deleteUser(id);
      }
      addNotification("Action successful", "success");
      loadData();
    } catch (err) {
      addNotification("Action failed.");
    }
  };

  /* =========================
      NOTIFICATIONS
  ========================== */
  const addNotification = (message, type = "error") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  /* =========================
      FILTERING
  ========================== */
  const filteredPros = data.allPros.filter(pro =>
    pro.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pro.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#0059FF', fontWeight: '600' }}>Initializing Secure Console...</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      {/* Notifications */}
      <div style={styles.notificationContainer}>
        {notifications.map(n => (
          <div
            key={n.id}
            style={{
              ...styles.notification,
              backgroundColor: n.type === "success" ? "#10b981" : "#ef4444"
            }}
          >
            {n.type === "success" ? "✓ " : "✕ "} {n.message}
          </div>
        ))}
      </div>

      {/* Header Section */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Admin Management</h2>
          <p style={styles.subtitle}>Manage professionals and platform health</p>
        </div>

        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.search}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.statsContainer}>
        <div style={styles.statBox}>
          <h4 style={styles.statLabel}>Total Professionals</h4>
          <p style={styles.statValue}>{data.stats.totalPros || 0}</p>
        </div>
        <div style={styles.statBox}>
          <h4 style={styles.statLabel}>Verified Assets</h4>
          <p style={styles.statValue}>{data.stats.verifiedPros || 0}</p>
        </div>
        <div style={styles.statBox}>
          <h4 style={{...styles.statLabel, color: '#f59e0b'}}>Pending Review</h4>
          <p style={{...styles.statValue, color: '#f59e0b'}}>{data.stats.pendingPros || 0}</p>
        </div>
      </div>

      {/* Grid Content */}
      <div style={styles.grid}>
        {filteredPros.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No records match your current search criteria.</p>
          </div>
        ) : (
          filteredPros.map(pro => (
            <AdminCard
              key={pro._id}
              pro={pro}
              onAction={handleAction}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* =========================
    BEAUTIFIED STYLES
========================= */
const styles = {
  wrapper: {
    padding: '40px 20px',
    maxWidth: '1240px',
    margin: '0 auto',
    fontFamily: "'Inter', -apple-system, sans-serif",
    backgroundColor: '#f8f9ff',
    minHeight: '100vh'
  },
  loadingWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    gap: '20px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #0059FF',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '40px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.025em'
  },
  subtitle: {
    margin: '5px 0 0',
    color: '#64748b',
    fontSize: '1rem'
  },
  searchWrapper: {
    flex: '1',
    maxWidth: '400px',
    minWidth: '300px'
  },
  search: {
    width: '100%',
    padding: '14px 20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    boxSizing: 'border-box'
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  },
  statBox: {
    background: '#ffffff',
    padding: '30px 24px',
    borderRadius: '20px',
    border: '1px solid #eef2ff',
    boxShadow: '0 10px 25px rgba(0, 89, 255, 0.04)',
    textAlign: 'left',
    borderTop: '5px solid #0059FF',
    transition: 'transform 0.2s ease'
  },
  statLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 10px 0'
  },
  statValue: {
    fontSize: '2.25rem',
    fontWeight: '800',
    color: '#0059FF',
    margin: 0
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '24px'
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '60px',
    background: '#fff',
    borderRadius: '20px',
    color: '#64748b',
    border: '2px dashed #e2e8f0'
  },
  notificationContainer: {
    position: 'fixed',
    top: 30,
    right: 30,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  notification: {
    color: '#fff',
    padding: '16px 24px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '0.9rem',
    boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
    minWidth: '250px',
    animation: 'slideIn 0.3s ease-out'
  }
};