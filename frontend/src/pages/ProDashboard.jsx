import React, { useState, useEffect } from 'react';
import API from '../services/api';

export default function ProDashboard() {
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [bookingsRes, profileRes] = await Promise.all([
        API.get('/bookings/my-bookings'),
        API.get('/pros/profile'),
      ]);

      setBookings(bookingsRes.data.bookings || []);
      setUser(profileRes.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await API.patch('/bookings/update-status', { bookingId, status: newStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const totalBookings = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const approvedCount = bookings.filter(b => b.status === 'approved').length;
  const rejectedCount = bookings.filter(b => b.status === 'rejected').length;

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div className="loader-spinner"></div>
        <p style={styles.loaderText}>Preparing your workspace…</p>
        <style>{`
          .loader-spinner {
            width: 70px;
            height: 70px;
            border: 5px solid rgba(99, 102, 241, 0.1);
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: loader-spin 0.8s ease-in-out infinite;
          }
          @keyframes loader-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const isVerified = user?.isVerified === true || user?.status === 'approved';

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>📋</span>
            <div>
              <p style={styles.statLabel}>Total Requests</p>
              <p style={styles.statValue}>{totalBookings}</p>
            </div>
          </div>
          <div style={{ ...styles.statCard, borderBottomColor: '#f59e0b' }}>
            <span style={styles.statIcon}>⏳</span>
            <div>
              <p style={styles.statLabel}>Pending</p>
              <p style={styles.statValue}>{pendingCount}</p>
            </div>
          </div>
          <div style={{ ...styles.statCard, borderBottomColor: '#22c55e' }}>
            <span style={styles.statIcon}>✅</span>
            <div>
              <p style={styles.statLabel}>Approved</p>
              <p style={styles.statValue}>{approvedCount}</p>
            </div>
          </div>
          <div style={{ ...styles.statCard, borderBottomColor: '#ef4444' }}>
            <span style={styles.statIcon}>❌</span>
            <div>
              <p style={styles.statLabel}>Rejected</p>
              <p style={styles.statValue}>{rejectedCount}</p>
            </div>
          </div>
        </div>

        <div style={styles.grid}>
          <section style={styles.mainCard}>
            <h3 style={styles.sectionTitle}>📬 Incoming Requests</h3>

            {bookings.length > 0 ? (
              bookings.map((req) => (
                <div
                  key={req._id}
                  style={{
                    ...styles.bookingCard,
                    borderLeftColor: statusColor(req.status),
                  }}
                  className="booking-card"
                >
                  <div style={styles.bookingHeader}>
                    <span style={styles.bookingStatusBadge(statusColor(req.status))}>
                      {req.status.toUpperCase()}
                    </span>
                    <span style={styles.bookingDate}>
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={styles.bookingContent}>
                    <div style={styles.clientDetails}>
                      <p style={styles.clientName}>👤 {req.client?.name || 'Client'}</p>
                      <p style={styles.clientInfo}>📧 {req.client?.email || 'N/A'}</p>
                      <p style={styles.clientInfo}>
                        📞{' '}
                        {req.client?.phone ? (
                          <a href={`tel:${req.client.phone}`} style={styles.link}>
                            {req.client.phone}
                          </a>
                        ) : 'N/A'}
                      </p>
                      <p style={styles.clientInfo}>📍 {req.client?.location || 'N/A'}</p>
                    </div>

                    {req.status === 'pending' && isVerified && (
                      <div style={styles.actions}>
                        <button
                          onClick={() => handleStatusUpdate(req._id, 'approved')}
                          style={styles.actionBtn}
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(req._id, 'rejected')}
                          style={styles.actionBtn}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <p>No requests yet</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// helpers
const statusColor = (status) =>
  status === 'approved' ? '#22c55e' :
  status === 'rejected' ? '#ef4444' :
  '#f59e0b';

// styles (fully functional — no function-style style bug)
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
    borderBottom: '4px solid #6366f1',
    boxShadow: '0 15px 30px -12px rgba(0,0,0,0.1)',
  },
  statIcon: { fontSize: '2.2rem' },
  statLabel: { margin: 0, fontSize: '0.9rem', color: '#64748b' },
  statValue: { margin: '4px 0 0', fontSize: '2rem', fontWeight: '800' },

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '28px',
  },
  mainCard: {
    background: '#fff',
    borderRadius: '32px',
    padding: '28px',
    boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)',
  },
  sectionTitle: { fontSize: '1.4rem', marginBottom: '20px' },

  bookingCard: {
    background: '#fff',
    padding: '18px',
    borderRadius: '20px',
    borderLeft: '6px solid',
    marginBottom: '14px',
    boxShadow: '0 8px 18px -6px rgba(0,0,0,0.06)',
  },

  bookingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },

  bookingStatusBadge: (color) => ({
    background: color + '20',
    color: color,
    padding: '4px 12px',
    borderRadius: '40px',
    fontSize: '0.75rem',
    fontWeight: '700',
  }),

  bookingDate: { fontSize: '0.8rem', color: '#94a3b8' },

  clientDetails: { flex: 1 },
  clientName: { margin: '0 0 8px', fontWeight: '600' },
  clientInfo: { margin: '4px 0', color: '#334155' },

  actions: { display: 'flex', gap: '10px' },

  actionBtn: {
    padding: '8px 16px',
    borderRadius: '24px',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    background: '#f1f5f9',
  },

  emptyState: { textAlign: 'center', padding: '40px' },

  loaderContainer: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: { marginTop: '16px' },
  link: { color: '#2563eb', textDecoration: 'underline' },
};
