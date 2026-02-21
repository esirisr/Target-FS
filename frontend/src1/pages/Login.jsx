import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login({ email, password });
      const { token, role } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      if (role === 'admin') navigate('/admin');
      else if (role === 'pro') navigate('/pro-dashboard');
      else if (role === 'client') navigate('/client-home');
      else navigate('/');

      alert("Welcome back!");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.orb1}></div>
      <div style={styles.orb2}></div>

      <form onSubmit={handleLogin} style={styles.card}>
        <header style={styles.header}>
          <div style={styles.badge}>Secure Access</div>
          <h2 style={styles.title}>Sign In</h2>
          <div style={styles.divider}></div>
          <p style={styles.subtitle}>Welcome back to the community</p>
        </header>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            backgroundColor: isHovered ? '#1e293b' : '#0f172a',
            transform: isHovered ? 'translateY(-2px)' : 'none',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>

        <p style={styles.redirectText}>
          Don't have an account?{' '}
          <span onClick={() => navigate('/register')} style={styles.link}>
            Create one
          </span>
        </p>
      </form>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
    fontFamily: "'Inter', sans-serif",
    position: 'fixed',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    top: '-10%',
    right: '-5%',
    width: '35vw',
    height: '35vw',
    borderRadius: '50%',
    background: 'rgba(79, 70, 229, 0.08)',
    filter: 'blur(90px)',
  },
  orb2: {
    position: 'absolute',
    bottom: '-10%',
    left: '-5%',
    width: '30vw',
    height: '30vw',
    borderRadius: '50%',
    background: 'rgba(59, 130, 246, 0.06)',
    filter: 'blur(90px)',
  },
  card: {
    width: '100%',
    maxWidth: '560px', // widened from 420px (≈30%+)
    backgroundColor: '#ffffff',
    padding: '48px', // more breathing space
    borderRadius: '26px',
    boxShadow: '0 28px 55px -14px rgba(0,0,0,0.12)',
    border: '1px solid #e2e8f0',
    zIndex: 1,
    boxSizing: 'border-box',
  },
  header: { textAlign: 'center', marginBottom: '36px' },
  badge: {
    display: 'inline-block',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '6px 14px',
    borderRadius: '22px',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.9px',
    marginBottom: '10px',
  },
  title: {
    margin: '0',
    fontSize: '30px',
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: '-0.5px',
  },
  divider: {
    width: '36px',
    height: '4px',
    backgroundColor: '#4f46e5',
    margin: '14px auto',
    borderRadius: '12px',
  },
  subtitle: { color: '#64748b', fontSize: '15px', fontWeight: '500' },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '24px',
  },
  label: {
    marginBottom: '8px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },
  input: {
    padding: '14px 18px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '15px',
    backgroundColor: '#f8fafc',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    width: '100%',
    padding: '16px',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '10px',
    boxShadow: '0 12px 18px -4px rgba(15, 23, 42, 0.25)',
  },
  redirectText: {
    textAlign: 'center',
    marginTop: '22px',
    fontSize: '14px',
    color: '#64748b',
  },
  link: {
    color: '#4f46e5',
    fontWeight: '700',
    cursor: 'pointer',
    textDecoration: 'none',
  },
};