import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

export default function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
    phone: '',
    location: '',
    skills: ''
  });

  // NOTE: The useEffect with document.body.style.overflow has been REMOVED 
  // to prevent the Home page from getting stuck.

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.location) newErrors.location = "Please select your city";

    if (formData.role === 'pro') {
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required for professionals";
      } else {
        const digitsOnly = formData.phone.replace(/\D/g, '');
        if (digitsOnly.length < 9 || digitsOnly.length > 12) {
          newErrors.phone = "Phone number must be 9-12 digits";
        }
      }
      if (!formData.skills) newErrors.skills = "Please select your trade";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    const dataToSend = {
      ...formData,
      skills: formData.role === 'pro' && formData.skills ? [formData.skills] : []
    };

    try {
      await register(dataToSend);
      showNotification("Registration successful! Redirecting...", "success");
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        showNotification(err.response?.data?.message || "Registration failed.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const locations = ["Hargeisa", "Burco", "Boorama", "Berbera", "Laascaanood", "Ceerigaabo"];
  const skillOptions = ["Plumber", "Electrician", "Carpenter", "Painter", "Mason", "Mechanic"];

  return (
    <div style={styles.pageContainer}>
      {notification && (
        <div style={{ ...styles.notification, borderLeftColor: notification.type === 'success' ? '#22c55e' : '#ef4444' }}>
          <span style={styles.notificationIcon}>{notification.type === 'success' ? '🎉' : '⚠️'}</span>
          <span style={styles.notificationMessage}>{notification.message}</span>
        </div>
      )}

      <div style={styles.card}>
        <form onSubmit={handleSubmit}>
          <header style={styles.header}>
            <h2 style={styles.title}>Create Account</h2>
          </header>

          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>FULL NAME</label>
              <input
                type="text"
                placeholder="Enter your full name"
                style={{ ...styles.input, borderColor: errors.name ? '#dc2626' : '#e0e7ff' }}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <span style={styles.errorText}>{errors.name}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="Enter your email"
                style={{ ...styles.input, borderColor: errors.email ? '#dc2626' : '#e0e7ff' }}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && <span style={styles.errorText}>{errors.email}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>LOCATION (CITY)</label>
              <select
                style={{ ...styles.input, borderColor: errors.location ? '#dc2626' : '#e0e7ff' }}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              >
                <option value="">Select your city</option>
                {locations.map(loc => (
                  <option key={loc} value={loc.toLowerCase()}>{loc}</option>
                ))}
              </select>
              {errors.location && <span style={styles.errorText}>{errors.location}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>PASSWORD</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                style={{ ...styles.input, borderColor: errors.password ? '#dc2626' : '#e0e7ff' }}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {errors.password && <span style={styles.errorText}>{errors.password}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>PHONE NUMBER</label>
              <input
                type="tel"
                placeholder="9-12 digits"
                style={{ ...styles.input, borderColor: errors.phone ? '#dc2626' : '#e0e7ff' }}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
            </div>

            <div style={styles.inputGroup}></div>

            <div style={styles.fullWidthGroup}>
              <label style={styles.label}>I AM JOINING AS A:</label>
              <div style={styles.toggleGroup}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'client', skills: '' })}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: formData.role === 'client' ? '#1d4ed8' : '#f1f5f9',
                    color: formData.role === 'client' ? '#fff' : '#1e293b',
                    border: '1px solid #e0e7ff'
                  }}
                >Client</button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'pro' })}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: formData.role === 'pro' ? '#1d4ed8' : '#f1f5f9',
                    color: formData.role === 'pro' ? '#fff' : '#1e293b',
                    border: '1px solid #e0e7ff'
                  }}
                >Professional</button>
              </div>
            </div>

            {formData.role === 'pro' && (
              <div style={styles.fullWidthGroup}>
                <label style={styles.label}>PRIMARY SKILL / TRADE</label>
                <select
                  style={{ ...styles.input, borderColor: errors.skills ? '#dc2626' : '#e0e7ff' }}
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                >
                  <option value="">Select your trade</option>
                  {skillOptions.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
                {errors.skills && <span style={styles.errorText}>{errors.skills}</span>}
              </div>
            )}
          </div>

          <div style={styles.buttonContainer}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                background: isHovered ? '#2563eb' : '#1d4ed8',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {loading ? 'Processing...' : 'Register Now'}
            </button>
            <p style={styles.footerText}>
              Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '85vh', 
    padding: '40px 20px',
    backgroundColor: '#ffffff',
    backgroundImage: 'radial-gradient(circle at 10px 10px, #e0e7ff 2px, transparent 2px)',
    backgroundSize: '30px 30px',
  },
  notification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '14px 18px',
    borderRadius: '16px',
    background: '#ffffff',
    boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
    borderLeft: '4px solid',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 9999,
  },
  notificationIcon: { fontSize: '1.4rem' },
  notificationMessage: { fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' },
  card: {
    width: '100%',
    maxWidth: '1000px',
    background: '#ffffff',
    padding: '40px',
    borderRadius: '28px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  },
  header: { textAlign: 'center', marginBottom: '28px' },
  title: { margin: 0, fontSize: '2rem', fontWeight: '800', color: '#1d4ed8' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  fullWidthGroup: { gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '8px', fontSize: '0.75rem', fontWeight: '800', color: '#1d4ed8', textTransform: 'uppercase' },
  input: { padding: '12px', borderRadius: '12px', border: '1px solid #e0e7ff', fontSize: '0.95rem', fontWeight: '600', outline: 'none' },
  errorText: { color: '#dc2626', fontSize: '0.7rem', fontWeight: '700', marginTop: '4px' },
  toggleGroup: { display: 'flex', gap: '16px' },
  toggleBtn: { flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' },
  buttonContainer: { marginTop: '28px' },
  button: { width: '100%', padding: '14px', color: '#fff', border: 'none', borderRadius: '40px', fontSize: '1rem', fontWeight: '800', cursor: 'pointer' },
  footerText: { textAlign: 'center', marginTop: '20px', fontWeight: '600' },
  link: { color: '#1d4ed8', textDecoration: 'none', fontWeight: '800' },
};