import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleCTA = () => {
    if (!token) return navigate('/login');
    if (role === 'admin') return navigate('/admin');
    if (role === 'pro') return navigate('/pro-dashboard');
    return navigate('/client-home');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.subLogo}>HOME-MAN</h1>
      <h2 style={styles.motto}>
        Expert Hands. Local Heart. <br />
        <span style={{ color: '#3b82f6' }}>Home Services Simplified.</span>
      </h2>

      <button
        onClick={handleCTA}
        style={styles.ctaButton}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        {token ? 'Back to Dashboard' : 'Get Started'}
      </button>
    </div>
  );
}

const styles = {
  container: { textAlign: 'center', padding: '120px 20px', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  subLogo: { fontSize: '14px', letterSpacing: '3px', color: '#64748b', textTransform: 'uppercase' },
  motto: { fontSize: '3.5rem', fontWeight: '900', margin: '20px 0 40px 0', lineHeight: '1.2' },
  ctaButton: { padding: '18px 45px', backgroundColor: '#000', color: '#fff', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', border: 'none', transition: 'all 0.3s ease', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }
};