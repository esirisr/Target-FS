import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ProCard from '../components/ProCard';

export default function ClientHome() {
  const [pros, setPros] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);

  const loadData = async () => {
    try {
      const [res, profile] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/profile')
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !user) return null;

  // LOCATION FILTER
  const userLocation = user.location?.toLowerCase();

  const filteredPros = pros.filter(pro => {
    return (
      pro.location?.toLowerCase() === userLocation &&
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
      <input
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

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
        <div>No professionals in your area.</div>
      )}
    </div>
  );
}
