import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ProCard from '../components/ProCard';

export default function ClientHome() {
  const [pros, setPros] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null); // 👈 added user state

  // Notification helper
  const addNotification = (message, type = 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Load data with user profile (for location filtering)
  const loadData = async () => {
    try {
      const [res, profile] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/profile') // your profile endpoint
      ]);

      const verifiedPros = (res.data.allPros || []).filter(
        p => p.isVerified && !p.isSuspended
      );

      setPros(verifiedPros);
      setUser(profile.data);

      const token = localStorage.getItem('token');
      if (token) {
        const bookRes = await API.get('/bookings/my-bookings');
        setRequests(bookRes.data.bookings || []);
      }

    } catch (err) {
      console.error("Error loading marketplace data:", err);
      addNotification('Failed to load professionals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // LOCATION + SEARCH FILTER
  const filteredPros = pros
    .filter(pro =>
      pro.location?.toLowerCase() === user?.location?.toLowerCase()
    )
    .filter(pro =>
      pro.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pro.skills?.some(skill =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div className="marketplace-loader"></div>
        <p style={styles.loaderText}>Discovering top professionals…</p>
      </div>
    );
  }

  if (!user) {
    return <div>Please login to view marketplace.</div>;
  }

  return (
    <div style={styles.page}>
      {notifications.length > 0 && (
        <div style={styles.toastContainer}>
          {notifications.map(n => (
            <div
              key={n.id}
              style={{
                ...styles.notificationItem,
                borderLeftColor: n.type === 'success' ? '#22c55e' : '#ef4444',
              }}
            >
              {n.message}
            </div>
          ))}
        </div>
      )}

      <div style={styles.backgroundBlobs}>
        <div style={styles.blob1}></div>
        <div style={styles.blob2}></div>
        <div style={styles.blob3}></div>
      </div>

      <div style={styles.container}>
        <header style={styles.hero}>
          <h1 style={styles.title}>
            Find your <span style={styles.gradient}>perfect expert</span>
          </h1>
          <p style={styles.subtitle}>
            Professionals in your area
          </p>

          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search by name or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </header>

        <section>
          {filteredPros.length > 0 ? (
            <div style={styles.proGrid}>
              {filteredPros.map(p => (
                <div key={p._id} style={styles.cardWrapper}>
                  <ProCard
                    pro={p}
                    onAction={loadData}
                    userBookings={requests}
                    role="client"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🔎</span>
              <p style={styles.emptyText}>No professionals in your area</p>
              <p style={styles.emptySubtext}>
                Try adjusting search or check back later
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
