import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminCard from '../components/AdminCard';

export default function AdminDashboard() {
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ msg: '', type: '' });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://tsbe-production.up.railway.app/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPros(res.data.allPros || []);
    } catch (err) {
      console.error("Admin fetch failed", err);
      showNotification("Failed to load management data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: '', type: '' }), 3500);
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleAction = async (id, type) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`https://tsbe-production.up.railway.app/api/admin/${type}`, { id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const message = type === 'delete' ? "User removed" : `Status updated: ${type}`;
      showNotification(message, "success");
      fetchData(); 
    } catch (err) {
      showNotification("Action failed", "error");
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px', fontFamily: 'sans-serif' }}>
      Loading Admin Console...
    </div>
  );

  return (
    <div style={styles.dashboardWrapper}>
      
      {/* --- NOTIFICATION BANNER --- */}
      {notification.msg && (
        <div style={{
          ...styles.notification,
          backgroundColor: notification.type === 'error' ? '#ef4444' : '#0f172a',
        }}>
          {notification.type === 'error' ? '⚠️ ' : '✅ '} {notification.msg}
        </div>
      )}

      {/* --- CENTERED HEADER SECTION --- */}
      <header style={styles.header}>
        <h1 style={styles.title}>Management Console</h1>
        <div style={styles.underline}></div>
        <p style={styles.subtitle}>
          Manage registered professionals and verify account credentials.
        </p>
      </header>

      {/* --- CENTERED GRID SYSTEM --- */}
      <div style={styles.gridContainer}>
        {pros.length > 0 ? (
          pros.map((pro) => (
            <AdminCard key={pro._id} pro={pro} onAction={handleAction} />
          ))
        ) : (
          <div style={styles.emptyState}>
            <h3>No professionals found in the database.</h3>
          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES OBJECT (Centered Layout Fix) ---
const styles = {
  dashboardWrapper: {
    padding: '40px 20px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Centers the header and grid horizontally
  },
  header: {
    textAlign: 'center',  // Centered text for title and subtitle
    marginBottom: '50px',
    width: '100%',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0',
    letterSpacing: '-1px',
  },
  underline: {
    width: '80px',
    height: '5px',
    backgroundColor: '#3b82f6',
    margin: '15px auto', // Centers the blue bar
    borderRadius: '10px',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1.1rem',
    maxWidth: '600px',
    margin: '0 auto', // Centers the paragraph if it wraps
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', // Flexible responsive grid
    gap: '30px',
    width: '100%',
    maxWidth: '1300px',
    justifyContent: 'center', // Centers cards within the grid container
  },
  notification: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',


    padding: '12px 30px',
    color: '#fff',
    borderRadius: '50px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    fontWeight: '600',
    fontSize: '14px',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '100px',
    color: '#94a3b8',
    border: '2px dashed #e2e8f0',
    borderRadius: '20px',
  }
};
