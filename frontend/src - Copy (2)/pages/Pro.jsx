import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function ProDashboard() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* =============================
     FETCH DATA
  ============================== */
  const fetchData = async () => {
    try {
      const [bookingsRes, profileRes] = await Promise.all([
        API.get('/bookings/my-bookings'),
        API.get('/pros/profile'),
      ]);

      setBookings(bookingsRes.data.bookings || []);
      setUser(profileRes.data || null);

    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        console.error('Dashboard fetch error:', err.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* =============================
     UPDATE STATUS
  ============================== */
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

  /* =============================
     DERIVED STATE
  ============================== */
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const approvedCount = bookings.filter(b => b.status === 'approved').length;

  const isVerified = user?.isVerified === true;
  const isSuspended = user?.isSuspended === true;

  /* =============================
     LOADING
  ============================== */
  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div className="loader-spinner"></div>
        <p style={styles.loaderText}>Syncing your professional profile…</p>
      </div>
    );
  }

  /* =============================
     UI
  ============================== */
  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* STATUS BANNER */}
        <div style={
          isSuspended
            ? styles.suspendedBanner
            : isVerified
              ? styles.verifiedBanner
              : styles.reviewBanner
        }>
          <div style={styles.bannerContent}>
            <span style={styles.bannerIcon}>
              {isSuspended ? '🚫' : isVerified ? '🛡️' : '⏳'}
            </span>
            <div>
              <h2 style={styles.bannerTitle}>
                {isSuspended
                  ? "Account Suspended"
                  : isVerified
                    ? "Approved & Verified"
                    : "Account Under Review"}
              </h2>
              <p style={styles.bannerSub}>
                {isSuspended
                  ? "Contact support to resolve account restrictions."
                  : isVerified
                    ? "Your profile is live. You can accept requests."
                    : "You cannot accept requests until approved."}
              </p>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div style={styles.statsGrid}>
          <StatCard icon="📊" label="Total Jobs" value={bookings.length} />
          <StatCard icon="🔔" label="Pending" value={pendingCount} />
          <StatCard icon="✅" label="Approved" value={approvedCount} />
        </div>

        {/* JOB LIST */}
        <div style={styles.mainCard}>
          <div style={styles.headerRow}>
            <h3 style={styles.sectionTitle}>📬 Job Queue</h3>
            <button
              onClick={() => {
                setRefreshing(true);
                fetchData();
              }}
              style={styles.refreshBtn}
            >
              {refreshing ? 'Refreshing...' : '🔄 Refresh'}
            </button>
          </div>

          {bookings.length === 0 ? (
            <div style={styles.emptyContainer}>
              <span style={styles.emptyIcon}>📭</span>
              <p>No job requests yet.</p>
            </div>
          ) : (
            bookings.map(req => (
              <div
                key={req._id}
                style={{
                  ...styles.bookingCard,
                  borderLeftColor: statusColor(req.status),
                }}
              >
                <div style={styles.bookingHeader}>
                  <span style={styles.bookingStatusBadge(statusColor(req.status))}>
                    {req.status}
                  </span>
                  <span style={styles.bookingDate}>
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div style={styles.bookingBody}>
                  <div>
                    <h4 style={styles.clientName}>
                      {req.client?.name || 'Client'}
                    </h4>

                    <p style={styles.detailText}>
                      📍 {req.client?.location || 'Not provided'}
                    </p>

                    {req.status === 'approved' ? (
                      <>
                        <p style={styles.detailText}>
                          📧 {req.client?.email || 'N/A'}
                        </p>
                        <p style={styles.phoneNumberText}>
                          📞 {req.client?.phone || 'No phone'}
                        </p>
                      </>
                    ) : (
                      <p style={styles.privacyNote}>
                        🔒 Accept to view phone number
                      </p>
                    )}
                  </div>

                  <div style={styles.actions}>
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(req._id, 'approved')}
                          disabled={!isVerified || isSuspended}
                          style={{
                            ...styles.acceptBtn,
                            opacity: (!isVerified || isSuspended) ? 0.5 : 1,
                            cursor: (!isVerified || isSuspended) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Accept
                        </button>

                        <button
                          onClick={() => handleStatusUpdate(req._id, 'rejected')}
                          style={styles.rejectBtn}
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {req.status === 'approved' && req.client?.phone && (
                      <a
                        href={`tel:${req.client.phone}`}
                        style={styles.callBtn}
                      >
                        📞 Call
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .loader-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e2e8f0;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* =============================
   SMALL COMPONENT
============================= */
function StatCard({ icon, label, value }) {
  return (
    <div style={styles.statCard}>
      <span style={styles.statIcon}>{icon}</span>
      <div>
        <p style={styles.statLabel}>{label}</p>
        <p style={styles.statValue}>{value}</p>
      </div>
    </div>
  );
}

/* =============================
   HELPERS
============================= */
const statusColor = (status) =>
  status === 'approved'
    ? '#10b981'
    : status === 'rejected'
      ? '#ef4444'
      : '#f59e0b';

/* =============================
   STYLES
============================= */
const styles = {
  page: { background: '#f8fafc', minHeight: '100vh' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' },

  reviewBanner: { background: '#fef3c7', padding: '24px', borderRadius: '20px', marginBottom: '30px' },
  verifiedBanner: { background: '#dcfce7', padding: '24px', borderRadius: '20px', marginBottom: '30px' },
  suspendedBanner: { background: '#fee2e2', padding: '24px', borderRadius: '20px', marginBottom: '30px' },

  bannerContent: { display: 'flex', alignItems: 'center', gap: '20px' },
  bannerIcon: { fontSize: '30px' },
  bannerTitle: { margin: 0 },
  bannerSub: { margin: '5px 0 0' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' },
  statCard: { background: '#fff', padding: '20px', borderRadius: '20px', display: 'flex', gap: '15px' },
  statIcon: { fontSize: '24px' },
  statLabel: { margin: 0, fontSize: '0.9rem' },
  statValue: { margin: 0, fontSize: '1.6rem', fontWeight: '800' },

  mainCard: { background: '#fff', borderRadius: '25px', padding: '30px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  sectionTitle: { margin: 0 },
  refreshBtn: { padding: '8px 15px', cursor: 'pointer' },

  bookingCard: { padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9', borderLeftWidth: '6px', marginBottom: '15px' },
  bookingHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  bookingStatusBadge: (color) => ({
    background: color + '20',
    color,
    padding: '6px 12px',
    borderRadius: '50px',
    fontSize: '12px',
    fontWeight: '700'
  }),
  bookingBody: { display: 'flex', justifyContent: 'space-between' },

  clientName: { margin: 0 },
  detailText: { margin: '5px 0' },
  phoneNumberText: { fontWeight: '800' },
  privacyNote: { fontStyle: 'italic', color: '#94a3b8' },

  actions: { display: 'flex', gap: '10px', alignItems: 'center' },
  acceptBtn: { background: '#10b981', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '10px' },
  rejectBtn: { background: '#f1f5f9', border: 'none', padding: '8px 15px', borderRadius: '10px' },
  callBtn: { background: '#6366f1', color: '#fff', padding: '8px 15px', borderRadius: '10px', textDecoration: 'none' },

  emptyContainer: { textAlign: 'center', padding: '40px' },
  emptyIcon: { fontSize: '40px' },

  loaderContainer: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
};