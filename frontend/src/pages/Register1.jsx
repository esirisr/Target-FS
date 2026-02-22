import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.location) {
      newErrors.location = "Please select your city";
    }

    if (formData.role === 'pro') {
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      }
      if (!formData.skills) {
        newErrors.skills = "Please select your trade";
      }
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

    try {
      const dataToSend = {
        ...formData,
        skills: formData.role === 'pro' && formData.skills ? [formData.skills] : []
      };

      await register(dataToSend);

      showNotification("Registration successful! Redirecting to login...", "success");

      setTimeout(() => {
        navigate('/login');
      }, 1000);

    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        showNotification(
          err.response?.data?.message || "Registration failed. Please try again.",
          "error"
        );
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
        <div
          style={{
            ...styles.notification,
            backgroundColor:
              notification.type === 'success' ? '#16a34a' : '#dc2626',
          }}
        >
          <span>{notification.message}</span>
          <button
            style={styles.closeBtn}
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}

      <form style={styles.card} onSubmit={handleSubmit}>
        <header style={styles.header}>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Select your city and join the community</p>
        </header>

        <div style={styles.formGrid}>

          {/* Name */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              style={{
                ...styles.input,
                borderColor: errors.name ? '#dc2626' : '#cbd5e1'
              }}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            {errors.name && <span style={styles.errorText}>{errors.name}</span>}
          </div>

          {/* Email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              style={{
                ...styles.input,
                borderColor: errors.email ? '#dc2626' : '#cbd5e1'
              }}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}
          </div>

          {/* Location */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Location (City)</label>
            <select
              style={{
                ...styles.input,
                borderColor: errors.location ? '#dc2626' : '#cbd5e1'
              }}
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            >
              <option value="">Select your city</option>
              {locations.map(loc => (
                <option key={loc} value={loc.toLowerCase()}>{loc}</option>
              ))}
            </select>
            {errors.location && <span style={styles.errorText}>{errors.location}</span>}
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              style={{
                ...styles.input,
                borderColor: errors.password ? '#dc2626' : '#cbd5e1'
              }}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            {errors.password && <span style={styles.errorText}>{errors.password}</span>}
          </div>

          {/* Role Toggle */}
          <div style={{ ...styles.inputGroup, gridColumn: 'span 3' }}>
            <label style={styles.label}>I am joining as a:</label>
            <div style={styles.toggleGroup}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'client' })}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: formData.role === 'client' ? '#000' : '#f1f5f9',
                  color: formData.role === 'client' ? '#fff' : '#475569'
                }}
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'pro' })}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: formData.role === 'pro' ? '#000' : '#f1f5f9',
                  color: formData.role === 'pro' ? '#fff' : '#475569'
                }}
              >
                Professional
              </button>
            </div>
          </div>

          {formData.role === 'pro' && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  style={{
                    ...styles.input,
                    borderColor: errors.phone ? '#dc2626' : '#cbd5e1'
                  }}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
              </div>

              <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
                <label style={styles.label}>Primary Skill / Trade</label>
                <select
                  style={{
                    ...styles.input,
                    borderColor: errors.skills ? '#dc2626' : '#cbd5e1'
                  }}
                  value={formData.skills}
                  onChange={(e) =>
                    setFormData({ ...formData, skills: e.target.value })
                  }
                >
                  <option value="">Select your trade</option>
                  {skillOptions.map(skill => (
                    <option key={skill} value={skill.toLowerCase()}>{skill}</option>
                  ))}
                </select>
                {errors.skills && <span style={styles.errorText}>{errors.skills}</span>}
              </div>
            </>
          )}

          <div style={{ gridColumn: 'span 3', marginTop: '20px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                backgroundColor: isHovered ? '#334155' : '#000'
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {loading ? 'Processing...' : 'Register Now'}
            </button>

            <p style={styles.footerText}>
              Already have an account?{" "}
              <Link to="/login" style={styles.link}>Login here</Link>
            </p>
          </div>

        </div>
      </form>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '20px',
    boxSizing: 'border-box',
    position: 'relative'
  },
  notification: {
    position: 'absolute',
    top: '30px',
    right: '30px',
    padding: '16px 22px',
    borderRadius: '14px',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '14px',
    boxShadow: '0 12px 25px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '15px',
    minWidth: '280px',
    zIndex: 9999,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '18px',
    cursor: 'pointer',
    fontWeight: '700',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '12px',
    marginTop: '6px',
    fontWeight: '500'
  },
  card: {
    width: '100%',
    maxWidth: '900px',
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a' },
  subtitle: { margin: '5px 0 0 0', color: '#64748b', fontSize: '15px' },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    columnGap: '25px',
    rowGap: '15px'
  },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: {
    marginBottom: '8px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    backgroundColor: '#fff'
  },
  toggleGroup: { display: 'flex', gap: '15px' },
  toggleBtn: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    transition: '0.3s'
  },
  button: {
    width: '100%',
    padding: '16px',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: '0.3s'
  },
  footerText: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#64748b'
  },
  link: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '700'
  }
};