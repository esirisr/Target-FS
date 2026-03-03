import React, { useState, useEffect } from 'react';
import { fetchDashboard, verifyPro, suspendPro, deleteUser } from '../services/api';
import AdminCard from '../components/AdminCard';

export default function Admin() {
  const [data, setData] = useState({ allPros: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);

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

  const addNotification = (message, type = "error") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const filteredPros = data.allPros.filter(pro =>
    pro.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pro.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div className="admin-loader"></div>
        <p style={styles.loaderText}>Initializing Secure Console...</p>
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
              borderLeftColor: n.type === 'success' ? '#22c55e' : '#ef4444',
            }}
            className="toast-slide-in"
          >
            <span style={styles.notificationIcon}>
              {n.type === 'success' ? '🎉' : '⚠️'}
            </span>
            <span style={styles.notificationMessage}>{n.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleContainer}>
          <h2 style={styles.title}>Admin Management</h2>
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

      {/* Responsive Grid */}
      <div style={styles.grid}>
        {filteredPros.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>🔍</span>
            <p style={styles.emptyText}>No records match your current search criteria.</p>
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

      <style>{`
        * {
          box-sizing: border-box;
        }
        .admin-loader {
          width: 60px;
          height: 60px;
          border: 6px solid #e0e7ff;
          border-top: 6px solid #1d4ed8;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .toast-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    padding: '30px 20px',
    maxWidth: '1600px',         // Increased to allow more cards per row on large screens
    margin: '0 auto',
    fontFamily: "'Inter', -apple-system, sans-serif",
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    backgroundImage: 'radial-gradient(circle at 10px 10px, #e0e7ff 2px, transparent 2px)',
    backgroundSize: '30px 30px',
  },
  loadingWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    gap: '20px',
    background: '#ffffff',
    backgroundImage: 'radial-gradient(circle at 20px 20px, #e0e7ff 3px, transparent 3px)',
    backgroundSize: '40px 40px',
  },
  loaderText: {
    color: '#1d4ed8',
    fontWeight: '800',
    fontSize: '1.2rem',
    letterSpacing: '0.5px',
    textShadow: '0 2px 4px rgba(29,78,216,0.2)',
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',       // Increased margin
    gap: '20px',
  },
  titleContainer: {
    flex: '1 1 auto',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(1.5rem, 5vw, 2rem)',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.025em',
  },
  searchWrapper: {
    flex: '1 1 300px',          // Slightly larger minimum width
    display: 'flex',
    justifyContent: 'flex-end',
  },
  search: {
    width: '100%',
    maxWidth: '380px',
    padding: '14px 20px',
    borderRadius: '40px',
    border: '1px solid #e0e7ff',
    backgroundColor: '#ffffff',
    fontSize: '1rem',
    fontWeight: '600',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(29,78,216,0.05)',
    boxSizing: 'border-box',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Increased min width from 260px to 280px
    gap: '24px',                // Larger gap
    justifyContent: 'center',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '60px 20px',
    background: '#ffffff',
    borderRadius: '48px',
    border: '2px dashed #e0e7ff',
    boxShadow: '0 20px 40px -15px rgba(29,78,216,0.1)',
  },
  emptyIcon: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '16px',
    color: '#1d4ed8',
    opacity: 0.8,
    filter: 'drop-shadow(0 8px 12px rgba(29,78,216,0.3))',
  },
  emptyText: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#1e293b',
  },
  notificationContainer: {
    position: 'fixed',
    top: 20,
    right: 20,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxWidth: '360px',
  },
  notification: {
    background: '#ffffff',
    padding: '14px 18px',
    borderRadius: '16px',
    boxShadow: '0 15px 30px -10px rgba(29,78,216,0.25), 0 0 0 1px rgba(29,78,216,0.1)',
    borderLeft: '4px solid',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '260px',
    backdropFilter: 'blur(8px)',
  },
  notificationIcon: {
    fontSize: '1.4rem',
  },
  notificationMessage: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
};