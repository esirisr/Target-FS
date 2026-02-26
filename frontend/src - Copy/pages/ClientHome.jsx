import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ProCard from '../components/ProCard';

export default function ClientHome() {
  const [pros, setPros] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      // 1️⃣ Fetch all professionals (public route still works if token exists)
      const res = await API.get('/admin/dashboard');

      const verifiedPros = (res.data.allPros || []).filter(
        p => p.isVerified && !p.isSuspended
      );

      setPros(verifiedPros);

      // 2️⃣ Fetch user bookings (only if logged in)
      const token = localStorage.getItem('token');
      if (token) {
        const bookRes = await API.get('/bookings/my-bookings');
        setRequests(bookRes.data.bookings || []);
      }

    } catch (err) {
      console.error("Error loading marketplace data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={styles.loader}>
        Loading Professionals...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <section>
        <h2 style={styles.centeredTitle}>
          Available Professionals
        </h2>

        <p style={styles.centeredSubtitle}>
          Choose an expert to start your project
        </p>

        <div style={styles.proGrid}>
          {pros.map(p => (
            <ProCard
              key={p._id}
              pro={p}
              onAction={loadData}
              userBookings={requests}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 20px'
  },
  loader: {
    textAlign: 'center',
    padding: '100px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#64748b'
  },
  centeredTitle: {
    fontSize: '2.5rem',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: '10px',
    color: '#000'
  },
  centeredSubtitle: {
    textAlign: 'center',
    color: '#64748b',
    marginBottom: '50px',
    fontSize: '1.1rem'
  },
  proGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '30px'
  }
};
