import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // 🚀 If already logged in, redirect automatically
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
      redirectByRole(role);
    }
  }, []);

  const redirectByRole = (role) => {
    if (role === 'admin') navigate('/admin', { replace: true });
    else if (role === 'pro') navigate('/pro-dashboard', { replace: true });
    else if (role === 'client') navigate('/client-home', { replace: true });
    else navigate('/');
  };

  const validate = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    }

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
      setErrors({
        general: err.response?.data?.message || 'Invalid credentials'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>Sign In</h2>

        {errors.general && <p style={styles.error}>{errors.general}</p>}

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          style={styles.input}
        />
        {errors.email && <p style={styles.error}>{errors.email}</p>}

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          style={styles.input}
        />
        {errors.password && <p style={styles.error}>{errors.password}</p>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Signing in...' : 'Login'}
        </button>

        <p style={{ marginTop: '15px' }}>
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/register')}
            style={styles.link}
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f8fafc'
  },
  card: {
    background: '#fff',
    padding: '40px',
    borderRadius: '12px',
    width: '400px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1'
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  error: {
    color: '#dc2626',
    fontSize: '13px'
  },
  link: {
    color: '#3b82f6',
    cursor: 'pointer',
    fontWeight: '600'
  }
};