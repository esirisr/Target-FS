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
      await API.patch('/bookings/update-status', { bookingId, status: newStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Compute stats
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
            box-shadow: 0 10px 20px -8px rgba(99, 102, 241, 0.4);
          }
          @keyframes loader-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const isVerified = user?.isVerified === true || user?.status === 'approved';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Professional';

  return (
    <div style={styles.page}>
      {/* Animated background blobs */}
      <div style={styles.backgroundBlobs}>
        <div style={styles.blob1}></div>
        <div style={styles.blob2}></div>
        <div style={styles.blob3}></div>
      </div>

      <div style={styles.container}>
        {/* Header with greeting */}
        <header style={styles.header}>
          <div style={styles.greeting}>
       
          </div>
     
        </header>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>📋</span>
            <div>
              <p style={styles.statLabel}>Total Requests</p>
              <p style={styles.statValue}>{totalBookings}</p>
            </div>
          </div>
          <div style={{...styles.statCard, borderBottomColor: '#f59e0b'}}>
            <span style={styles.statIcon}>⏳</span>
            <div>
              <p style={styles.statLabel}>Pending</p>
              <p style={styles.statValue}>{pendingCount}</p>
            </div>
          </div>
          <div style={{...styles.statCard, borderBottomColor: '#22c55e'}}>
            <span style={styles.statIcon}>✅</span>
            <div>
              <p style={styles.statLabel}>Approved</p>
              <p style={styles.statValue}>{approvedCount}</p>
            </div>
          </div>
          <div style={{...styles.statCard, borderBottomColor: '#ef4444'}}>
            <span style={styles.statIcon}>❌</span>
            <div>
              <p style={styles.statLabel}>Rejected</p>
              <p style={styles.statValue}>{rejectedCount}</p>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div style={styles.grid}>
          {/* Incoming Requests */}
          <section style={styles.mainCard}>
            <h3 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}>📬</span> Incoming Requests
            </h3>

            {bookings.length > 0 ? (
              bookings.map((req) => (
                <div
                  key={req._id}
                  className="booking-card"
                  style={{
                    ...styles.bookingCard,
                    borderLeftColor: statusColor(req.status),
                  }}
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
                      <p style={styles.clientName}>
                        <span style={styles.clientIcon}>👤</span> {capitalize(req.client?.name) || 'Client'}
                      </p>
                      <p style={styles.clientInfo}>
                        <span style={styles.infoIcon}>📧</span> {req.client?.email || 'N/A'}
                      </p>
                      <p style={styles.clientInfo}>
                        <span style={styles.infoIcon}>📞</span>{' '}
                        {req.client?.phone ? (
                          <a href={`tel:${req.client.phone}`} style={styles.link}>
                            {req.client.phone}
                          </a>
                        ) : 'N/A'}
                      </p>
                      <p style={styles.clientInfo}>
                        <span style={styles.infoIcon}>📍</span> {req.client?.location ? capitalize(req.client.location) : 'N/A'}
                      </p>
                    </div>

                    {req.status === 'pending' && isVerified && (
                      <div style={styles.actions}>
                        <button
                          onClick={() => handleStatusUpdate(req._id, 'approved')}
                          className="btn-accept"
                          style={styles.actionBtn}
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(req._id, 'rejected')}
                          className="btn-reject"
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
                <span style={styles.emptyIcon}>📭</span>
                <p style={styles.emptyText}>No requests yet</p>
                <p style={styles.emptySubtext}>Clients will appear here when they hire you.</p>
              </div>
            )}
          </section>

          {/* Profile Status & Tips */}
          <aside style={styles.sideCard}>
            <h3 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}>⚙️</span> Profile Status
            </h3>

            <div style={styles.statusContainer}>
              <div style={styles.statusPill(isVerified)}>
                <span style={styles.statusDot}>●</span>
                <span>{isVerified ? 'Active & Approved' : 'Under Review'}</span>
              </div>

              <div style={styles.metaInfo}>
                <p style={styles.metaItem}>
                  <span>🆔</span> Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
                <p style={styles.metaItem}>
                  <span>⭐</span> Rating: {user?.rating ? user.rating.toFixed(1) : 'New'}
                </p>
              </div>
            </div>

            <div style={styles.divider}></div>

            <div style={styles.tipBox}>
              <span style={styles.tipIcon}>💡</span>
              <p style={styles.tipText}>
                {isVerified
                  ? 'Respond quickly to boost your ranking and win more jobs.'
                  : 'Your profile is under review. You can accept jobs once approved.'}
              </p>
            </div>

            {isVerified && (
              <button style={styles.shareBtn} className="share-btn">
                🔗 Share your profile
              </button>
            )}
          </aside>
        </div>
      </div>

      {/* Global Styles (animations, hover effects, etc.) */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .booking-card {
          transition: all 0.25s ease;
        }
        .booking-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 30px -10px rgba(0,0,0,0.15);
        }
        .btn-accept, .btn-reject {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .btn-accept:hover {
          transform: scale(1.02);
          box-shadow: 0 10px 20px -8px #22c55e;
        }
        .btn-reject:hover {
          transform: scale(1.02);
          box-shadow: 0 10px 20px -8px #ef4444;
        }
        .share-btn:hover {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          transform: scale(1.02);
          box-shadow: 0 12px 24px -10px #6366f1;
        }
      `}</style>
    </div>
  );
}

// Helpers
const statusColor = (status) => {
  if (status === 'approved') return '#22c55e';
  if (status === 'rejected') return '#ef4444';
  return '#f59e0b';
};

const capitalize = (text) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : '';

// Styles
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
    position: 'relative',
    zIndex: 2,
  },
  backgroundBlobs: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    zIndex: 0,
  },
  blob1: {
    position: 'absolute',
    top: '-150px',
    left: '-120px',
    width: '450px',
    height: '450px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0) 70%)',
    filter: 'blur(70px)',
    animation: 'float 18s ease-in-out infinite',
  },
  blob2: {
    position: 'absolute',
    bottom: '-180px',
    right: '-100px',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(236,72,153,0.18) 0%, rgba(236,72,153,0) 70%)',
    filter: 'blur(90px)',
    animation: 'float 22s ease-in-out infinite reverse',
  },
  blob3: {
    position: 'absolute',
    top: '30%',
    left: '60%',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0) 70%)',
    filter: 'blur(70px)',
    animation: 'pulse-glow 8s ease-in-out infinite',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '40px',
  },
  greeting: {},
  title: {
    fontSize: 'clamp(2rem, 4vw, 2.8rem)',
    fontWeight: '800',
    margin: 0,
    color: '#0f172a',
  },
  gradient: {
    background: 'linear-gradient(135deg, #4f46e5, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    margin: '8px 0 0',
    color: '#475569',
    fontSize: '1.1rem',
  },
  profileBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(10px)',
    padding: '10px 20px',
    borderRadius: '60px',
    border: '1px solid rgba(203,213,225,0.5)',
    boxShadow: '0 8px 20px -6px rgba(0,0,0,0.05)',
  },
  badgeIcon: {
    fontSize: '1.5rem',
  },
  badgeText: {
    fontWeight: '500',
    color: '#1e293b',
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
    transition: 'transform 0.2s ease',
  },
  statIcon: {
    fontSize: '2.2rem',
  },
  statLabel: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '500',
    letterSpacing: '0.3px',
  },
  statValue: {
    margin: '4px 0 0',
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 1,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '28px',
    alignItems: 'start',
  },
  mainCard: {
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(16px)',
    borderRadius: '40px',
    padding: '32px',
    border: '1px solid rgba(226,232,240,0.6)',
    boxShadow: '0 25px 40px -18px rgba(15,23,42,0.15)',
  },
  sideCard: {
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(16px)',
    padding: '32px 24px',
    borderRadius: '40px',
    border: '1px solid rgba(226,232,240,0.6)',
    boxShadow: '0 25px 40px -18px rgba(15,23,42,0.1)',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#0f172a',
  },
  sectionIcon: {
    fontSize: '1.8rem',
  },
  bookingCard: {
    background: '#ffffff',
    padding: '20px',
    borderRadius: '28px',
    borderLeft: '6px solid',
    marginBottom: '16px',
    boxShadow: '0 8px 18px -6px rgba(0,0,0,0.06)',
  },
  bookingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  bookingStatusBadge: (color) => ({
    background: color + '20',
    color: color,
    padding: '4px 12px',
    borderRadius: '40px',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.3px',
  }),
  bookingDate: {
    fontSize: '0.8rem',
    color: '#94a3b8',
  },
  bookingContent: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    margin: '0 0 8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  clientIcon: {
    fontSize: '1.2rem',
  },
  clientInfo: {
    margin: '4px 0',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#334155',
  },
  infoIcon: {
    fontSize: '1rem',
    opacity: 0.7,
  },
  actions: {
    display: 'flex',
    gap: '12px',
    alignSelf: 'center',
  },
  actionBtn: {
    padding: '10px 20px',
    borderRadius: '40px',
    border: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: '#f1f5f9',
    color: '#1e293b',
    boxShadow: '0 4px 8px -4px rgba(0,0,0,0.1)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyIcon: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '16px',
    opacity: 0.5,
  },
  emptyText: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#475569',
    margin: '0 0 8px',
  },
  emptySubtext: {
    color: '#94a3b8',
    margin: 0,
  },
  statusContainer: {
    background: '#f8fafc',
    borderRadius: '28px',
    padding: '20px',
    marginBottom: '20px',
  },
  statusPill: (isVerified) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: isVerified ? '#22c55e20' : '#f59e0b20',
    color: isVerified ? '#16a34a' : '#d97706',
    borderRadius: '40px',
    fontWeight: '600',
    marginBottom: '16px',
  }),
  statusDot: {
    fontSize: '1.2rem',
    lineHeight: 1,
  },
  metaInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metaItem: {
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#475569',
    fontSize: '0.9rem',
  },
  divider: {
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
    margin: '24px 0',
  },
  tipBox: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    background: '#f1f5f9',
    padding: '16px',
    borderRadius: '24px',
    marginBottom: '24px',
  },
  tipIcon: {
    fontSize: '1.5rem',
  },
  tipText: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#334155',
    lineHeight: 1.5,
  },
  shareBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '40px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'underline',
  },
  loaderContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(145deg, #f1f5f9, #f8fafc)',
  },
  loaderText: {
    marginTop: '24px',
    fontSize: '1.2rem',
    color: '#1e293b',
    fontWeight: '500',
  },
};