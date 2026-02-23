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
      if (type === 'verify') {
        await verifyPro(id);
      }

      if (type === 'suspend') {
        await suspendPro(id);
      }

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

  /* =========================
     LOADING STATE
  ========================== */
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        Loading Admin Console...
      </div>
    );
  }

  /* =========================
     UI
  ========================== */
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
            {n.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={styles.header}>
        <h2>Admin Management Console</h2>

        <input
          type="text"
          placeholder="Search professionals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.search}
        />
      </div>

      {/* Stats */}
      <div style={styles.statsContainer}>
        <div style={styles.statBox}>
          <h4>Total Pros</h4>
          <p>{data.stats.totalPros || 0}</p>
        </div>
        <div style={styles.statBox}>
          <h4>Verified</h4>
          <p>{data.stats.verifiedPros || 0}</p>
        </div>
        <div style={styles.statBox}>
          <h4>Pending</h4>
          <p>{data.stats.pendingPros || 0}</p>
        </div>
      </div>

      {/* Cards */}
      <div style={styles.grid}>
        {filteredPros.length === 0 ? (
          <p>No professionals found.</p>
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
   STYLES
========================= */
const styles = {
  wrapper: {
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '30px'
  },
  search: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    marginTop: '10px'
  },
  statsContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px'
  },
  statBox: {
    flex: 1,
    background: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    textAlign: 'center'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  notificationContainer: {
    position: 'fixed',
    top: 20,
    right: 20,
    zIndex: 9999
  },
  notification: {
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '8px',
    marginBottom: '10px'
  }
};