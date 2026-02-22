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

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const approvedCount = bookings.filter(b => b.status === 'approved').length;

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div className="loader-spinner"></div>
        <p style={styles.loaderText}>Syncing your professional profile…</p>
      </div>
    );
  }

  // --- LOGIC FOR VERIFICATION STATUS ---
  const isVerified = user?.isVerified === true;
  const isSuspended = user?.isSuspended === true;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        
        {/* Verification Status Banner */}
        <div style={isSuspended ? styles.suspendedBanner : (isVerified ? styles.verifiedBanner : styles.reviewBanner)}>
          <div style={styles.bannerContent}>
            <span style={styles.bannerIcon}>
              {isSuspended ? '🚫' : (isVerified ? '🛡️' : '⏳')}
            </span>
            <div>
              <h2 style={styles.bannerTitle}>
                {isSuspended 
                  ? "Account Suspended" 
                  : (isVerified ? "Approved & Verified" : "Your Account is Under Review")}
              </h2>
              <p style={styles.bannerSub}>
                {isSuspended 
                  ? "Please contact support to resolve account issues." 
                  : (isVerified 
                      ? "Your profile is live! You can now accept incoming requests." 
                      : "You cannot accept requests yet.")}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>📊</span>
            <div>
              <p style={styles.statLabel}>Total Jobs</p>
              <p style={styles.statValue}>{bookings.length}</p>
            </div>
          </div>
          <div style={{ ...styles.statCard, borderBottomColor: '#f59e0b' }}>
            <span style={styles.statIcon}>🔔</span>
            <div>
              <p style={styles.statLabel}>New Requests</p>
              <p style={styles.statValue}>{pendingCount}</p>
            </div>
          </div>
          <div style={{ ...styles.statCard, borderBottomColor: '#10b981' }}>
            <span style={styles.statIcon}>✅</span>
            <div>
              <p style={styles.statLabel}>Approved</p>
              <p style={styles.statValue}>{approvedCount}</p>
            </div>
          </div>
        </div>

        <div style={styles.mainLayout}>
          <section style={styles.mainCard}>
            <div style={styles.headerRow}>
              <h3 style={styles.sectionTitle}>📬 Job Queue</h3>
              <button onClick={fetchData} style={styles.refreshBtn}>🔄 Refresh</button>
            </div>

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
                      {req.status}
                    </span>
                    <span style={styles.bookingDate}>
                      {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div style={styles.bookingBody}>
                    <div style={styles.clientInfo}>
                      <h4 style={styles.clientName}>{req.client?.name || 'Client'}</h4>
                      <p style={styles.detailText}>📍 {req.client?.location || 'Not provided'}</p>
                      
                      {/* PHONE NUMBER REVEAL LOGIC */}
                      {req.status === 'approved' ? (
                        <>
                           <p style={styles.detailText}>📧 {req.client?.email || 'N/A'}</p>
                           <p style={styles.phoneNumberText}>📞 {req.client?.phone || 'No phone provided'}</p>
                        </>
                      ) : (
                        <p style={styles.privacyNote}>🔒 Accept to see phone number</p>
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
                      
              
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyContainer}>
                <span style={styles.emptyIcon}>📭</span>
                <p>No job requests found yet.</p>
              </div>
            )}
          </section>
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
        @keyframes spin { to { transform: rotate(360deg); } }
        .booking-card { transition: transform 0.2s ease; }
        .booking-card:hover { transform: translateX(5px); }
      `}</style>
    </div>
  );
}

const statusColor = (status) =>
  status === 'approved' ? '#10b981' :
  status === 'rejected' ? '#ef4444' :
  '#f59e0b';

const styles = {
  page: {
    background: '#f8fafc',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  reviewBanner: {
    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    border: '1px solid #fde68a',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '32px',
    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.1)',
  },
  verifiedBanner: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    border: '1px solid #bbf7d0',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '32px',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.1)',
  },
  suspendedBanner: {
    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    border: '1px solid #fecaca',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '32px',
  },
  bannerContent: { display: 'flex', alignItems: 'center', gap: '20px' },
  bannerIcon: { fontSize: '32px' },
  bannerTitle: { margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' },
  bannerSub: { margin: '4px 0 0', color: '#475569', fontSize: '0.95rem' },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    background: '#fff',
    padding: '24px',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
    borderBottom: '4px solid #6366f1'
  },
  statIcon: { fontSize: '28px' },
  statLabel: { margin: 0, color: '#64748b', fontWeight: '600', fontSize: '0.9rem' },
  statValue: { margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' },

  mainCard: {
    background: '#fff',
    borderRadius: '30px',
    padding: '30px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.04)',
  },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  sectionTitle: { margin: 0, fontSize: '1.5rem', fontWeight: '800' },
  refreshBtn: { padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'none', cursor: 'pointer', fontWeight: '600' },

  bookingCard: {
    padding: '20px',
    borderRadius: '20px',
    background: '#fff',
    border: '1px solid #f1f5f9',
    borderLeftWidth: '6px',
    marginBottom: '16px',
  },
  bookingHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px' },
  bookingStatusBadge: (color) => ({
    background: color + '15',
    color: color,
    padding: '6px 14px',
    borderRadius: '100px',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }),
  bookingBody: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  clientName: { margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: '700' },
  detailText: { margin: '4px 0', fontSize: '0.9rem', color: '#64748b' },
  phoneNumberText: { margin: '8px 0', fontSize: '1rem', fontWeight: '800', color: '#6366f1' },
  privacyNote: { margin: '8px 0', fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' },

  actions: { display: 'flex', gap: '10px' },
  acceptBtn: { background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '700' },
  rejectBtn: { background: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '700' },
  callBtn: { background: '#6366f1', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem' },

  emptyContainer: { textAlign: 'center', padding: '60px 0', color: '#94a3b8' },
  emptyIcon: { fontSize: '48px', display: 'block', marginBottom: '10px' },
  loaderContainer: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' },
};