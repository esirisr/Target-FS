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
        API.get('/pros/profile')
      ]);

      setBookings(bookingsRes.data.bookings || []);
      setUser(profileRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err.message);
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
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div className="spinner" style={styles.spinner}></div>
        <p style={styles.loaderText}>Loading your workspace...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spinner {
            border: 4px solid rgba(0,0,0,0.1);
            border-left-color: #4f46e5;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
        `}</style>
      </div>
    );
  }

  const isVerified = user?.isVerified === true || user?.status === 'approved';

  return (
    <div style={styles.page}>
      {/* Decorative blobs */}
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>
      <div className="blob blob3"></div>

      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>
            <span style={styles.gradientText}>Professional Workspace</span>
          </h1>
       
      
        </header>

        <div style={styles.grid}>
          {/* Main Card – Hire Requests */}
          <div style={styles.mainCard}>
            <h3 style={styles.sectionTitle}>📋 Incoming Hire Requests</h3>

            {bookings.length > 0 ? (
              bookings.map(req => (
                <div
                  key={req._id}
                  className="booking-item"
                  style={{
                    ...styles.bookingCard,
                    borderLeftColor: statusColor(req.status),
                  }}
                >
                  <div style={styles.bookingContent}>
                    <div>
                      <p style={styles.clientName}>
                        <strong>Customer:</strong> {capitalize(req.client?.name)}
                      </p>
                      <p style={styles.clientInfo}>
                        <strong>Email:</strong> {req.client?.email || 'N/A'}
                      </p>
                      <p style={styles.clientInfo}>
                        <strong>Phone:</strong>{' '}
                        {req.client?.phone ? (
                          <a href={`tel:${req.client.phone}`} style={{ color: '#2563eb', textDecoration: 'underline' }}>
                            {req.client.phone}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </p>
                      <p style={styles.statusText}>
                        Status:{' '}
                        <span style={{ fontWeight: '800', color: statusColor(req.status) }}>
                          {req.status.toUpperCase()}
                        </span>
                      </p>
                    </div>

                    {req.status === 'pending' && isVerified && (
                      <div style={styles.actions}>
                        <button
                          onClick={() => handleStatusUpdate(req._id, 'approved')}
                          className="action-btn accept"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(req._id, 'rejected')}
                          className="action-btn reject"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p style={styles.noRequestText}>
                No requests yet. They'll appear here once clients hire you.
              </p>
            )}
          </div>

          {/* Side Card – Profile Status */}
          <div
            style={{
              ...styles.sideCard,
              borderColor: isVerified ? '#e2e8f0' : '#fbbf24',
              background: isVerified
                ? 'linear-gradient(145deg, #ffffff, #f9fafb)'
                : 'linear-gradient(145deg, #fffdfa, #fff7ed)',
            }}
          >
            <h3 style={styles.sectionTitle}>👤 Profile Status</h3>
            <div style={styles.statusPill}>
              <span style={styles.statusDot}>●</span>
              <span style={{ fontWeight: '700' }}>
                {isVerified ? 'Active & Approved' : 'Under Review'}
              </span>
            </div>
            <div style={styles.divider} />
            <p style={styles.tipText}>
              {isVerified
                ? "✨ Tip: Accepting requests quickly improves your ranking and helps you get more jobs."
                : "⏳ Your profile is under review. You will be able to accept jobs once an admin approves you."}
            </p>
          </div>
        </div>
      </div>

      {/* Global animations and hover styles */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          z-index: 0;
          animation: float 10s infinite ease-in-out;
        }
        .blob1 {
          top: -150px;
          left: -100px;
          width: 400px;
          height: 400px;
          background: rgba(79, 70, 229, 0.15);
        }
        .blob2 {
          bottom: -100px;
          right: -50px;
          width: 350px;
          height: 350px;
          background: rgba(236, 72, 153, 0.1);
          animation-delay: -3s;
        }
        .blob3 {
          top: 40%;
          left: 60%;
          width: 300px;
          height: 300px;
          background: rgba(59, 130, 246, 0.1);
          animation-delay: -6s;
        }
        .booking-item {
          transition: all 0.3s ease;
        }
        .booking-item:hover {
          transform: translateX(5px);
          box-shadow: 0 10px 20px -8px rgba(0,0,0,0.15);
        }
        .action-btn {
          padding: 8px 20px;
          border: none;
          border-radius: 40px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 10px -2px rgba(0,0,0,0.1);
        }
        .action-btn.accept {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }
        .action-btn.accept:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 15px -5px #10b981;
        }
        .action-btn.reject {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }
        .action-btn.reject:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 15px -5px #ef4444;
        }
      `}</style>
    </div>
  );
}

// Helper functions
const statusColor = (status) => {
  if (status === 'approved') return '#10b981';
  if (status === 'rejected') return '#ef4444';
  return '#f59e0b';
};

const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Styles
const styles = {
  page: {
    position: 'relative',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    overflowX: 'hidden',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 20px 80px',
    position: 'relative',
    zIndex: 2,
  },
  loaderContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  spinner: {
    border: '4px solid rgba(0,0,0,0.1)',
    borderLeftColor: '#4f46e5',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    marginBottom: '20px',
  },
  loaderText: {
    fontSize: '1.2rem',
    color: '#334155',
    fontWeight: '500',
  },
  header: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  title: {
    fontSize: 'clamp(2.2rem, 6vw, 3rem)',
    fontWeight: '900',
    margin: '0 0 10px',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  underline: {
    width: '100px',
    height: '4px',
    background: 'linear-gradient(90deg, #4f46e5 0%, #ec4899 100%)',
    margin: '20px auto',
    borderRadius: '2px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#475569',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '30px',
    alignItems: 'start',
  },
  mainCard: {
    background: 'white',
    padding: '30px',
    borderRadius: '32px',
    border: '1px solid rgba(226, 232, 240, 0.6)',
    boxShadow: '0 20px 30px -10px rgba(0,0,0,0.05), 0 5px 15px rgba(0,0,0,0.02)',
    backdropFilter: 'blur(4px)',
  },
  sideCard: {
    padding: '30px 25px',
    borderRadius: '32px',
    border: '2px solid',
    boxShadow: '0 20px 30px -10px rgba(0,0,0,0.05)',
    backdropFilter: 'blur(4px)',
    height: 'fit-content',
  },
  sectionTitle: {
    fontSize: '1.6rem',
    fontWeight: '800',
    marginBottom: '25px',
    color: '#0f172a',
    textAlign: 'center',
  },
  bookingCard: {
    background: '#f8fafc',
    padding: '20px',
    borderRadius: '24px',
    marginBottom: '16px',
    borderLeft: '6px solid',
    boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
    cursor: 'pointer',
  },
  bookingContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  clientName: {
    margin: '0',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  clientInfo: {
    margin: '5px 0',
    color: '#475569',
    fontSize: '0.95rem',
  },
  statusText: {
    margin: '5px 0',
    fontSize: '0.95rem',
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  noRequestText: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: '30px',
    fontSize: '1rem',
    background: '#f8fafc',
    borderRadius: '24px',
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: '#f1f5f9',
    borderRadius: '40px',
    marginBottom: '20px',
    fontSize: '1rem',
  },
  statusDot: {
    fontSize: '1.5rem',
    lineHeight: 1,
    color: '#10b981',
  },
  divider: {
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
    margin: '20px 0',
  },
  tipText: {
    fontSize: '0.95rem',
    color: '#475569',
    lineHeight: '1.6',
    textAlign: 'center',
  },
};