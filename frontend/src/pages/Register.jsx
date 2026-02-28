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

    // Phone validation: required only for professionals
    if (formData.role === 'pro' && !formData.phone.trim()) {
      newErrors.phone = "Phone number is required for professionals";
    }

    if (formData.role === 'pro' && !formData.skills) {
      newErrors.skills = "Please select your trade";
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

    // Prepare data for backend – skills must be an array for pros
    const dataToSend = {
      ...formData,
      skills: formData.role === 'pro' && formData.skills ? [formData.skills] : []
    };

    console.log('Sending registration data:', dataToSend);

    try {
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
      {/* Notification */}
      {notification && (
        <div
          style={{
            ...styles.notification,
            borderLeftColor: notification.type === 'success' ? '#22c55e' : '#ef4444',
          }}
          className="toast-slide-in"
        >
          <span style={styles.notificationIcon}>
            {notification.type === 'success' ? '🎉' : '⚠️'}
          </span>
          <span style={styles.notificationMessage}>{notification.message}</span>
          <button style={styles.closeBtn} onClick={() => setNotification(null)}>
            ×
          </button>
        </div>
      )}

      {/* Registration Form */}
      <div style={styles.card}>
        <form onSubmit={handleSubmit}>
          <header style={styles.header}>
            <h2 style={styles.title}>Create Account</h2>
          </header>

          {/* Form Grid - 3 columns */}
          <div style={styles.formGrid}>
            {/* Row 1: Full Name, Email, Location */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>FULL NAME</label>
              <input
                type="text"
                placeholder="Enter your full name"
                style={{
                  ...styles.input,
                  borderColor: errors.name ? '#dc2626' : '#e0e7ff'
                }}
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
                style={{
                  ...styles.input,
                  borderColor: errors.email ? '#dc2626' : '#e0e7ff'
                }}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && <span style={styles.errorText}>{errors.email}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>LOCATION (CITY)</label>
              <select
                style={{
                  ...styles.input,
                  borderColor: errors.location ? '#dc2626' : '#e0e7ff'
                }}
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

            {/* Row 2: Password, Phone */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>PASSWORD</label>
              <input
                type="password"
                placeholder="Enter password (min. 6 characters)"
                style={{
                  ...styles.input,
                  borderColor: errors.password ? '#dc2626' : '#e0e7ff'
                }}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {errors.password && <span style={styles.errorText}>{errors.password}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                PHONE NUMBER {formData.role === 'pro' && <span style={{ color: '#dc2626' }}>*</span>}
              </label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                style={{
                  ...styles.input,
                  borderColor: errors.phone ? '#dc2626' : '#e0e7ff'
                }}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
            </div>

            {/* Empty div to maintain 3 columns */}
            <div style={styles.inputGroup}></div>

            {/* Row 3: Role Toggle */}
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
                    borderColor: formData.role === 'client' ? '#1d4ed8' : '#e0e7ff',
                  }}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'pro' })}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: formData.role === 'pro' ? '#1d4ed8' : '#f1f5f9',
                    color: formData.role === 'pro' ? '#fff' : '#1e293b',
                    borderColor: formData.role === 'pro' ? '#1d4ed8' : '#e0e7ff',
                  }}
                >
                  Professional
                </button>
              </div>
            </div>

            {/* Row 4: Skills - Only for pros */}
            {formData.role === 'pro' && (
              <div style={styles.fullWidthGroup}>
                <label style={styles.label}>PRIMARY SKILL / TRADE</label>
                <select
                  style={{
                    ...styles.input,
                    borderColor: errors.skills ? '#dc2626' : '#e0e7ff'
                  }}
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

          {/* Submit Button */}
          <div style={styles.buttonContainer}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                background: isHovered 
                  ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' 
                  : 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {loading ? 'Processing...' : 'Register Now'}
            </button>

            <p style={styles.footerText}>
              Already have an account?{' '}
              <Link to="/login" style={styles.link}>Login here</Link>
            </p>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer style={styles.pageFooter}>
        © 2026 HOME-MAN Platform. All rights reserved.
      </footer>

      <style>{`
        .toast-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .full-width-group {
            grid-column: span 2 !important;
          }
        }
        @media (max-width: 576px) {
          .form-grid {
            grid-template-columns: 1fr !important;
          }
          .full-width-group {
            grid-column: span 1 !important;
          }
          .toggle-group {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
}

/* =============================
   UPDATED STYLES (royal blue & white, bold & larger)
============================= */
const styles = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    padding: '20px',
    boxSizing: 'border-box',
    position: 'relative',
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
    boxShadow: '0 15px 30px -10px rgba(29,78,216,0.25), 0 0 0 1px rgba(29,78,216,0.1)',
    borderLeft: '4px solid',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '260px',
    maxWidth: '90%',
    zIndex: 9999,
    backdropFilter: 'blur(8px)',
  },
  notificationIcon: {
    fontSize: '1.4rem',
  },
  notificationMessage: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    fontSize: '20px',
    cursor: 'pointer',
    fontWeight: '700',
    padding: '0 4px',
    lineHeight: 1,
  },
  card: {
    width: '100%',
    maxWidth: '1100px',
    background: 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    padding: '36px',
    borderRadius: '28px',
    boxShadow: '0 20px 40px -12px rgba(29,78,216,0.2), 0 0 0 1px rgba(29,78,216,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    marginBottom: '16px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 30px 50px -15px rgba(29,78,216,0.3)',
    },
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    margin: '8px 0 0 0',
    color: '#334155',
    fontSize: '1rem',
    fontWeight: '600',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginBottom: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minWidth: 0,
  },
  fullWidthGroup: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginTop: '4px',
  },
  label: {
    marginBottom: '8px',
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#1d4ed8',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #e0e7ff',
    fontSize: '0.95rem',
    fontWeight: '600',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    height: '46px',
    ':focus': {
      borderColor: '#1d4ed8',
      boxShadow: '0 0 0 3px rgba(29,78,216,0.2)',
    },
  },
  errorText: {
    color: '#dc2626',
    fontSize: '0.7rem',
    fontWeight: '700',
    marginTop: '4px',
    lineHeight: '1.2',
  },
  toggleGroup: {
    display: 'flex',
    gap: '16px',
    width: '100%',
  },
  toggleBtn: {
    flex: 1,
    padding: '12px',
    border: '1px solid',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
  },
  buttonContainer: {
    marginTop: '28px',
  },
  button: {
    width: '100%',
    padding: '14px',
    color: '#fff',
    border: 'none',
    borderRadius: '40px',
    fontSize: '1rem',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    height: '52px',
    boxShadow: '0 4px 12px -4px #1d4ed8',
  },
  footerText: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#334155',
  },
  link: {
    color: '#1d4ed8',
    textDecoration: 'none',
    fontWeight: '800',
    fontSize: '0.9rem',
  },
  pageFooter: {
    textAlign: 'center',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#64748b',
    padding: '16px',
    width: '100%',
  },
};