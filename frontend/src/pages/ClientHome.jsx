import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ProCard from '../components/ProCard';

export default function ClientHome() {
  const [pros, setPros] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);

  // Notification helper
  const addNotification = (message, type = 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Load marketplace + user profile
  const loadData = async () => {
    try {
      const [res, profile] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/profile') // must return user with location
      ]);

      setUser(profile.data);

      const verifiedPros = (res.data.allPros || []).filter(
        p => p.isVerified && !p.isSuspended
      );

      setPros(verifiedPros);

      const token = localStorage.getItem('token');
      if (token) {
        const bookRes = await API.get('/bookings/my-bookings');
        setRequests(bookRes.data.bookings || []);
      }

    } catch (err) {
      console.error("Load error:", err);
      addNotification('Failed to load professionals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login.</div>;

  // 🔥 LOCATION FILTER (KEY PART)
  const userLocation = user.location?.toLowerCase();

  const filteredPros = pros.filter(pro => {
    const proLocation = pro.location?.toLowerCase();

    return (
      proLocation &&
      userLocation &&
      proLocation === userLocation &&
      (
        pro.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pro.skills?.some(skill =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  });

  return (
    <div>
      {notifications.map(n => (
        <div key={n.id}>{n.message}</div>
      ))}

      <header>
        <input
          placeholder="Search..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </header>

      {filteredPros.length > 0 ? (
        filteredPros.map(p => (
          <ProCard
            key={p._id}
            pro={p}
            role="client"
            onAction={loadData}
            userBookings={requests}
          />
        ))
      ) : (
        <div>No professionals in your location.</div>
      )}
    </div>
  );
}
