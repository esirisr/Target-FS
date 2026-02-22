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
      console.error('Error fetching dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await API.patch('/bookings/update-status', {
        bookingId,
        status: newStatus,
      });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  /* ===========================
     🔥 LOCATION FILTER (KEY PART)
  ============================ */

  const sameLocationBookings = bookings.filter(
    (req) =>
      req.client?.location?.toLowerCase() ===
      user?.location?.toLowerCase()
  );

  /* ===========================
     📊 STATS (BASED ON FILTERED)
  ============================ */

  const totalBookings = sameLocationBookings.length;
  const pendingCount = sameLocationBookings.filter(
    (b) => b.status === 'pending'
  ).length;
  const approvedCount = sameLocationBookings.filter(
    (b) => b.status === 'approved'
  ).length;
  const rejectedCount = sameLocationBookings.filter(
    (b) => b.status === 'rejected'
  ).length;

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div className="loader-spinner"></div>
        <p style={styles.loaderText}>Preparing your workspace…</p>
      </div>
    );
  }

  const isVerified =
    user?.isVerified === true || user?.status === 'approved';

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Stats */}
        <div style={styles.statsGrid}>
          <StatCard icon="📋" label="Total Requests" value={totalBookings} />
          <StatCard icon="⏳" label="Pending" value={pendingCount} />
          <StatCard icon="✅" label="Approved" value={approvedCount} />
          <StatCard icon="❌" label="Rejected" value={rejectedCount} />
        </div>

        {/* Requests */}
        <div style={styles.mainCard}>
          <h3 style={styles.sectionTitle}>📬 Incoming Requests</h3>

          {sameLocationBookings.length > 0 ? (
            sameLocationBookings.map((req) => (
              <div
                key={req._id}
                style={{
                  ...styles.bookingCard,
                  borderLeftColor: statusColor(req.status),
                }}
              >
                <div style={styles.bookingHeader}>
                  <span
                    style={styles.badge(statusColor(req.status))}
                  >
                    {req.status.toUpperCase()}
                  </span>
                  <span style={styles.bookingDate}>
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div style={styles.clientDetails}>
                  <p>
                    👤 {capitalize(req.client?.name) || 'Client'}
                  </p>
                  <p>📧 {req.client?.email || 'N/A'}</p>
                  <p>📞 {req.client?.phone || 'N/A'}</p>
                  <p>
                    📍 {capitalize(req.client?.location) || 'N/A'}
                  </p>
                </div>

                {req.status === 'pending' && isVerified && (
                  <div style={styles.actions}>
                    <button
                      style={styles.acceptBtn}
                      onClick={() =>
                        handleStatusUpdate(req._id, 'approved')
                      }
                    >
                      Accept
                    </button>
                    <button
                      style={styles.rejectBtn}
                      onClick={() =>
                        handleStatusUpdate(req._id, 'rejected')
                      }
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={styles.empty}>
              No same-location requests found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===========================
   🧩 Small Components
=========================== */

function StatCard({ icon, label, value }) {
  return (
    <div style={styles.statCard}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <div>
        <p style={{ margin: 0, fontSize: 14 }}>{label}</p>
        <h2 style={{ margin: 0 }}>{value}</h2>
      </div>
    </div>
  );
}

/* ===========================
   🛠 Helpers
=========================== */

const statusColor = (status) => {
  if (status === 'approved') return '#22c55e';
  if (status === 'rejected') return '#ef4444';
  return '#f59e0b';
};

const capitalize = (text) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : '';

/* ===========================
   🎨 Styles
=========================== */

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f1f5f9',
    padding: 40,
    fontFamily: 'Inter, sans-serif',
  },
  container: {
    maxWidth: 1100,
    margin: '0 auto',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 20,
    marginBottom: 30,
  },
  statCard: {
    background: '#fff',
    padding: 20,
    borderRadius: 20,
    display: 'flex',
    gap: 15,
    alignItems: 'center',
  },
  mainCard: {
    background: '#fff',
    padding: 30,
    borderRadius: 25,
  },
  sectionTitle: {
    marginBottom: 20,
  },
  bookingCard: {
    borderLeft: '6px solid',
    padding: 20,
    marginBottom: 15,
    borderRadius: 20,
    background: '#fafafa',
  },
  bookingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badge: (color) => ({
    background: color + '20',
    color: color,
    padding: '4px 12px',
    borderRadius: 20,
    fontWeight: 600,
  }),
  bookingDate: {
    fontSize: 12,
    color: '#777',
  },
  clientDetails: {
    marginBottom: 10,
  },
  actions: {
    display: 'flex',
    gap: 10,
  },
  acceptBtn: {
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 20,
    cursor: 'pointer',
  },
  rejectBtn: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 20,
    cursor: 'pointer',
  },
  empty: {
    padding: 20,
    textAlign: 'center',
    color: '#777',
  },
  loaderContainer: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 20,
  },
};
