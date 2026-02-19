import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProCard from '../components/ProCard';

export default function Home() {
  const navigate = useNavigate();
  const [pros, setPros] = useState([]);
  const [notification, setNotification] = useState({ msg: '', type: '' });

  const fetchPros = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://tsbe-production.up.railway.app/api/admin/dashboard', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      const publicList = (res.data.allPros || []).filter(p => p.isVerified && p.email !== 'himiloone@gmail.com');
      setPros(publicList.slice(0, 3));
    } catch (err) { 
      console.log("Home fetch error:", err); 
    }
  };

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchPros();
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#fff', position: 'relative' }}>
      
      {/* CSS Animation for Notification */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* --- IN-PAGE NOTIFICATION TOAST --- */}
      {notification.msg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '15px 25px',
          backgroundColor: notification.type === 'error' ? '#ef4444' : '#3b82f6',
          color: '#fff',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          fontWeight: 'bold',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {notification.msg}
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <h1 style={{ fontSize: '16px', letterSpacing: '3px', color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase' }}>
        Target Solution
      </h1>
      
      <h2 style={{ fontSize: '3rem', fontWeight: '900', margin: '20px 0', lineHeight: '1.2' }}>
        Ku soo dhawaaw <span style={{ color: '#3b82f6' }}>Target Solution</span>. <br />
        Ku soo biir si aad u hesho xirfadle, <br />
        ama si aad u iibiso xirfadaada.
      </h2>

      <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '30px' }}>
        Xalka ugu habboon ee lagu xiro macaamiisha iyo xirfadlayaasha.
      </p>
      
      <button 
        onClick={() => navigate('/login')} 
        style={{ 
          padding: '18px 50px', 
          backgroundColor: '#000', 
          color: '#fff', 
          borderRadius: '12px', 
          cursor: 'pointer', 
          fontWeight: 'bold', 
          border: 'none', 
          fontSize: '1rem',
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        Get Started / Ku Biir
      </button>

      {/* --- FEATURED PROS --- */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '30px', 
        marginTop: '60px', 
        maxWidth: '1200px', 
        margin: '60px auto 0 auto' 
      }}>
        {pros.map(p => (
          <ProCard 
            key={p._id} 
            pro={p} 
            role="guest" 
            onAction={() => showNotification("Fadlan marka hore gal nidaamka (Login) si aad u hesho xirfadlahan.", "error")}
          />
        ))}
      </div>
    </div>
  );
}
