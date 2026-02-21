import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import ProCard from '../components/ProCard';

export default function Home() {
  const navigate = useNavigate();
  const [pros, setPros] = useState([]);

  useEffect(() => {
    const fetchPros = async () => {
      try {
        const res = await API.get('/admin/dashboard');

        const publicList = (res.data.allPros || [])
          .filter(p => p.isVerified && p.email !== 'himilo@gmail.com')
          .slice(0, 3);

        setPros(publicList);

      } catch (err) {
        console.log("Home fetch error:", err);
      }
    };

    fetchPros();
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#fff' }}>
      
      <h1 style={{ fontSize: '14px', letterSpacing: '2px', color: '#64748b' }}>
        HOME-MAN
      </h1>

      <h2 style={{ fontSize: '3.5rem', fontWeight: '900', margin: '20px 0' }}>
        Expert Hands. Local Heart. <br />
        <span style={{ color: '#3b82f6' }}>
          Home Services Simplified.
        </span>
      </h2>

      <button
        onClick={() => navigate('/login')}
        style={{
          padding: '15px 40px',
          backgroundColor: '#000',
          color: '#fff',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          border: 'none',
          marginBottom: '40px'
        }}
      >
        Get Started
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginTop: '40px',
          maxWidth: '1200px',
          margin: '40px auto 0 auto'
        }}
      >
        {pros.map(p => (
          <ProCard
            key={p._id}
            pro={p}
            role="guest"
          />
        ))}
      </div>
    </div>
  );
}
