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
        <div style={{
          ...styles.bannerBase,
          ...(isSuspended
            ? styles.suspendedBanner
            : isVerified
              ? styles.verifiedBanner
              : styles.reviewBanner)
        }}>
          <div style={styles.bannerContent}>
            <span style={styles.bannerIcon}>
              {isSuspended ? '🚫' : isVerified ? '🛡️' : '⏳'}
            </span>
            <div style={styles.bannerText}>
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
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : '🔄 Refresh'}
            </button>
          </div>

          {bookings.length === 0 ? (
            <div style={styles.emptyContainer}>
              <span style={styles.emptyIcon}>📭</span>
              <p style={styles.emptyText}>No job requests yet.</p>
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
                  <div style={styles.bookingInfo}>
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
                          disabled={!isVerified || isSuspended || refreshing}
                          style={{
                            ...styles.acceptBtn,
                            opacity: (!isVerified || isSuspended || refreshing) ? 0.5 : 1,
                            cursor: (!isVerified || isSuspended || refreshing) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Accept
                        </button>

                        <button
                          onClick={() => handleStatusUpdate(req._id, 'rejected')}
                          disabled={refreshing}
                          style={{
                            ...styles.rejectBtn,
                            opacity: refreshing ? 0.5 : 1,
                            cursor: refreshing ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {req.status === 'approved' && req.client?.phone && (
                      <a
  
                      >
             
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
          width: 60px;
          height: 60px;
          border: 6px solid #e0e7ff;
          border-top-color: #1d4ed8;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive Media Queries (unchanged but inherited) */
        @media (max-width: 1024px) {
          .container {
            padding: 30px 20px !important;
          }
          .stats-grid {
            gap: 16px !important;
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 20px 16px !important;
          }
          .banner-content {
            gap: 12px !important;
          }
          .banner-icon {
            font-size: 24px !important;
          }
          .banner-title {
            font-size: 1.2rem !important;
          }
          .banner-sub {
            font-size: 0.85rem !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
            margin-bottom: 30px !important;
          }
          .stat-card {
            padding: 16px !important;
          }
          .stat-value {
            font-size: 1.4rem !important;
          }
          .main-card {
            padding: 20px !important;
          }
          .booking-card {
            padding: 16px !important;
          }
          .booking-body {
            flex-direction: column !important;
            gap: 15px !important;
          }
          .booking-info {
            width: 100% !important;
          }
          .actions {
            width: 100% !important;
            justify-content: flex-start !important;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 16px 12px !important;
          }
          .banner-content {
            flex-direction: column !important;
            text-align: center !important;
            gap: 8px !important;
          }
          .banner-text {
            text-align: center !important;
          }
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .stat-card {
            padding: 14px !important;
          }
          .header-row {
            flex-direction: column !important;
            gap: 10px !important;
            align-items: flex-start !important;
          }
          .refresh-btn {
            width: 100% !important;
            justify-content: center !important;
          }
          .booking-header {
            flex-direction: column !important;
            gap: 8px !important;
            align-items: flex-start !important;
          }
          .booking-status-badge {
            align-self: flex-start !important;
          }
          .booking-date {
            font-size: 0.8rem !important;
          }
          .client-name {
            font-size: 1rem !important;
          }
          .detail-text, .privacy-note {
            font-size: 0.85rem !important;
          }
          .actions {
            flex-direction: column !important;
            gap: 8px !important;
          }
          .accept-btn, .reject-btn, .call-btn {
            width: 100% !important;
            text-align: center !important;
            padding: 12px !important;
          }
          .empty-container {
            padding: 30px 20px !important;
          }
          .empty-icon {
            font-size: 3rem !important;
          }
          .empty-text {
            font-size: 0.9rem !important;
          }
        }

        @media (max-width: 360px) {
          .container {
            padding: 12px 10px !important;
          }
          .banner-title {
            font-size: 1rem !important;
          }
          .banner-sub {
            font-size: 0.8rem !important;
          }
          .stat-label {
            font-size: 0.8rem !important;
          }
          .stat-value {
            font-size: 1.2rem !important;
          }
          .section-title {
            font-size: 1rem !important;
          }
        }

        /* Landscape Mode */
        @media (orientation: landscape) and (max-height: 600px) {
          .container {
            padding: 15px !important;
          }
          .stats-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .booking-card {
            margin-bottom: 10px !important;
          }
        }

        /* Tablet Landscape */
        @media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }

        /* Improve touch targets on mobile */
        @media (max-width: 768px) {
          button, .refresh-btn, .accept-btn, .reject-btn, .call-btn {
            min-height: 44px !important;
          }
        }

        /* Smooth transitions */
        .booking-card, .stat-card, .banner-base {
          transition: all 0.3s ease !important;
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
      <div style={styles.statInfo}>
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
   UPDATED STYLES (royal blue & white, bold & larger)
============================= */
const styles = {
  page: { 
    background: '#ffffff', 
    minHeight: '100vh',
    width: '100%',
    overflowX: 'hidden',
    backgroundImage: 'radial-gradient(circle at 10px 10px, #e0e7ff 2px, transparent 2px)',
    backgroundSize: '30px 30px',
  },
  container: { 
    maxWidth: '1100px', 
    margin: '0 auto', 
    padding: '40px 20px',
  },

  // Banners – keep functional colors but adjust typography
  bannerBase: { 
    padding: '24px', 
    borderRadius: '20px', 
    marginBottom: '30px',
    boxShadow: '0 10px 25px -8px rgba(29,78,216,0.15)',
    border: '1px solid rgba(0,0,0,0.05)',
  },
  reviewBanner: { 
    background: '#fef3c7', 
  },
  verifiedBanner: { 
    background: '#dcfce7', 
  },
  suspendedBanner: { 
    background: '#fee2e2', 
  },

  bannerContent: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '20px',
  },
  bannerIcon: { 
    fontSize: '32px',
    flexShrink: 0,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: { 
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '800',
  },
  bannerSub: { 
    margin: '5px 0 0',
    fontSize: '1rem',
    fontWeight: '600',
    opacity: 0.8,
  },

  statsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(3, 1fr)', 
    gap: '20px', 
    marginBottom: '40px',
  },
  statCard: { 
    background: 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    padding: '24px', 
    borderRadius: '24px', 
    display: 'flex', 
    gap: '16px',
    boxShadow: '0 10px 25px -8px rgba(29,78,216,0.15), 0 0 0 1px rgba(29,78,216,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 20px 30px -12px rgba(29,78,216,0.25)',
    }
  },
  statIcon: { 
    fontSize: '28px',
    flexShrink: 0,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: { 
    margin: 0, 
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  statValue: { 
    margin: 0, 
    fontSize: '2rem', 
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 1.2,
  },

  mainCard: { 
    background: 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    borderRadius: '28px', 
    padding: '30px',
    boxShadow: '0 15px 35px -10px rgba(29,78,216,0.2), 0 0 0 1px rgba(29,78,216,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  headerRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  sectionTitle: { 
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#0f172a',
  },
  refreshBtn: { 
    padding: '10px 20px',
    background: '#e0e7ff',
    border: '1px solid #1d4ed8',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#1d4ed8',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    ':hover': {
      background: '#1d4ed8',
      color: '#fff',
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 20px -8px #1d4ed8',
    }
  },

  bookingCard: { 
    padding: '20px', 
    borderRadius: '20px', 
    border: '1px solid #e0e7ff', 
    borderLeftWidth: '6px', 
    marginBottom: '15px',
    background: '#ffffff',
    boxShadow: '0 4px 12px rgba(29,78,216,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 24px -8px rgba(29,78,216,0.2)',
    }
  },
  bookingHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '12px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  bookingStatusBadge: (color) => ({
    background: color + '20',
    color,
    padding: '6px 14px',
    borderRadius: '50px',
    fontSize: '0.8rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  }),
  bookingDate: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#64748b',
  },
  bookingBody: { 
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '15px',
  },
  bookingInfo: {
    flex: 1,
    minWidth: '200px',
  },
  clientName: { 
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '4px',
  },
  detailText: { 
    margin: '4px 0',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  phoneNumberText: { 
    fontWeight: '800',
    color: '#0f172a',
    margin: '4px 0',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  privacyNote: { 
    fontStyle: 'italic', 
    color: '#94a3b8',
    fontSize: '0.9rem',
    fontWeight: '600',
    margin: '4px 0',
  },

  actions: { 
    display: 'flex', 
    gap: '10px', 
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  acceptBtn: { 
    background: '#10b981', 
    color: '#fff', 
    border: 'none', 
    padding: '10px 20px', 
    borderRadius: '40px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 10px -4px #10b981',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 20px -8px #10b981',
    }
  },
  rejectBtn: { 
    background: '#f1f5f9', 
    border: '1px solid #e0e7ff',
    padding: '10px 20px', 
    borderRadius: '40px',
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#334155',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      background: '#fee2e2',
      borderColor: '#ef4444',
      color: '#ef4444',
    }
  },
  callBtn: { 
    background: '#1d4ed8', 
    color: '#fff', 
    padding: '10px 20px', 
    borderRadius: '40px',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '700',
    display: 'inline-block',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 10px -4px #1d4ed8',
    ':hover': {
      background: '#2563eb',
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 20px -8px #1d4ed8',
    }
  },

  emptyContainer: { 
    textAlign: 'center', 
    padding: '60px 20px',
    background: '#ffffff',
    borderRadius: '24px',
    border: '2px dashed #e0e7ff',
  },
  emptyIcon: { 
    fontSize: '4rem',
    display: 'block',
    marginBottom: '12px',
    color: '#1d4ed8',
    opacity: 0.6,
  },
  emptyText: {
    color: '#64748b',
    fontSize: '1.1rem',
    fontWeight: '700',
    margin: 0,
  },

  loaderContainer: { 
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: '#ffffff',
    backgroundImage: 'radial-gradient(circle at 20px 20px, #e0e7ff 3px, transparent 3px)',
    backgroundSize: '40px 40px',
  },
  loaderText: { 
    marginTop: '20px', 
    color: '#1d4ed8', 
    fontWeight: '800',
    fontSize: '1.1rem',
  },
};