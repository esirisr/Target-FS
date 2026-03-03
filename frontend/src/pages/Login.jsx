import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) redirectByRole(role);
  }, []);

  const redirectByRole = (role) => {
    if (role === 'admin') navigate('/admin', { replace: true });
    else if (role === 'pro') navigate('/pro-dashboard', { replace: true });
    else if (role === 'client') navigate('/client-home', { replace: true });
    else navigate('/');
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      const res = await login(form);
      const { token, role } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      redirectByRole(role);
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Invalid credentials' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="login-container">
      {/* Added classNames to match your media queries */}
      <form onSubmit={handleSubmit} style={styles.card} className="login-card">
        <h2 style={styles.title} className="login-title">Sign In</h2>

        {errors.general && <p style={styles.error} className="login-error">{errors.general}</p>}

        <div style={{ width: '100%', marginBottom: '15px' }}>
          <input
            type="email"
            placeholder="Email"
            className="login-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={styles.input}
          />
          {errors.email && <p style={styles.error} className="login-error">{errors.email}</p>}
        </div>

        <div style={{ width: '100%', marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={styles.input}
          />
          {errors.password && <p style={styles.error} className="login-error">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="login-button"
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {})
          }}
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>

        <p style={styles.registerText} className="login-register-text">
          Don't have an account?{' '}
          <span onClick={() => navigate('/register')} style={styles.link}>
            Register
          </span>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', // Balanced for all devices
    background: '#f8fafc',
    padding: '20px',
    boxSizing: 'border-box',
    overflowY: 'auto', // Allow scroll if content is taller than screen
  },
  card: {
    background: '#fff',
    padding: '40px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    boxSizing: 'border-box',
  },
  title: {
    marginBottom: '24px',
    textAlign: 'center',
    color: '#1e293b',
    fontSize: '2rem',
    fontWeight: '700',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#1d4ed8',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '10px',
  },
  buttonDisabled: {
    background: '#94a3b8',
    cursor: 'not-allowed',
  },
  error: {
    color: '#dc2626',
    fontSize: '13px',
    marginTop: '4px',
    textAlign: 'left',
  },
  registerText: {
    marginTop: '20px',
    textAlign: 'center',
    color: '#475569',
    fontSize: '0.95rem',
  },
  link: {
    color: '#3b82f6',
    cursor: 'pointer',
    fontWeight: '600',
  },
};

// Global style injection remains the same, but now it works 
// because we added the className props to the elements.
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  @media (max-width: 480px) {
    .login-card { padding: 30px 20px !important; margin-top: 20px; }
    .login-title { font-size: 1.75rem !important; }
    .login-container { justify-content: flex-start !important; padding-top: 5vh !important; }
  }
  @media (max-height: 600px) {
    .login-container { padding-top: 20px !important; }
    .login-card { padding: 20px !important; }
  }
`;
document.head.appendChild(styleTag);