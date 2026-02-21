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
    <div style={styles.page}>
      {/* Navbar */}
      <header style={styles.navbar}>
        <h1 style={{ color: '#fff', fontWeight: '700' }}>HOME-MAN-PLATFORM</h1>
      </header>

      {/* Decorative background elements */}
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>
      <div className="blob blob3"></div>

      {/* Hero Section */}
      <section style={styles.hero}>
        <h2 style={styles.title}>
          Expert Hands. Local Heart. <br />
          <span style={styles.highlight}>Home Services Simplified.</span>
        </h2>
        <div style={styles.underline}></div>
        <button
          onClick={() => navigate('/login')}
          className="cta-button"
          style={styles.getStartedBtn}
        >
          Get Started
        </button>
      </section>

      {/* How It Works Section */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>How It Works</h3>
        <div style={styles.stepsContainer}>
          <div className="step-card" style={styles.stepCard}>
            <div style={styles.stepNumber}>1</div>
            <h4 style={styles.stepHeading}>Describe your task</h4>
            <p style={styles.stepText}>Tell us what you need done, when and where.</p>
          </div>
          <div className="step-card" style={styles.stepCard}>
            <div style={styles.stepNumber}>2</div>
            <h4 style={styles.stepHeading}>Choose a pro</h4>
            <p style={styles.stepText}>Browse verified professionals and pick the best fit.</p>
          </div>
          <div className="step-card" style={styles.stepCard}>
            <div style={styles.stepNumber}>3</div>
            <h4 style={styles.stepHeading}>Get it done</h4>
            <p style={styles.stepText}>The pro arrives and completes the job.</p>
          </div>
        </div>
      </section>

      {/* Featured Professionals */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Featured Professionals</h3>
        <div style={styles.gridWrapper}>
          {pros.map(p => (
            <div key={p._id} className="pro-card-wrapper">
              <ProCard pro={p} role="guest" />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2025 HOME-MAN. All rights reserved.</p>
        <div style={styles.footerLinks}>
          <span style={styles.footerLink}>Privacy</span>
          <span style={styles.footerLink}>Terms</span>
          <span style={styles.footerLink}>Contact</span>
        </div>
      </footer>

      {/* Global styles */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .blob {
          position: absolute;
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(37,99,235,0.1) 100%);
          border-radius: 50%;
          filter: blur(60px);
          z-index: 0;
          animation: float 8s infinite ease-in-out;
        }
        .blob1 {
          top: -100px;
          left: -100px;
          width: 400px;
          height: 400px;
          background: rgba(59,130,246,0.15);
        }
        .blob2 {
          bottom: -50px;
          right: -50px;
          width: 350px;
          height: 350px;
          background: rgba(139,92,246,0.15);
          animation-delay: -3s;
        }
        .blob3 {
          top: 40%;
          left: 60%;
          width: 250px;
          height: 250px;
          background: rgba(236,72,153,0.1);
          animation-delay: -5s;
        }
        .cta-button {
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 30px rgba(0,0,0,0.15);
          background: linear-gradient(135deg, #000 0%, #1e293b 100%) !important;
        }
        .step-card {
          transition: all 0.3s ease;
        }
        .step-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 30px -10px rgba(0,0,0,0.15);
        }
        .pro-card-wrapper {
          transition: all 0.3s ease;
        }
        .pro-card-wrapper:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    position: 'relative',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    overflowX: 'hidden',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    paddingTop: '80px',   // height of navbar
    paddingBottom: '80px', // height of footer
  },
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '80px',
    background: '#0f172a',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
  },
  hero: {
    textAlign: 'center',
    padding: '60px 20px',
    position: 'relative',
    zIndex: 2,
  },
  title: {
    fontSize: 'clamp(2.5rem, 8vw, 4rem)',
    fontWeight: '900',
    margin: '0 0 10px',
    lineHeight: '1.2',
    color: '#0f172a',
  },
  highlight: {
    color: '#3b82f6',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  underline: {
    width: '120px',
    height: '4px',
    background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
    margin: '30px auto',
    borderRadius: '2px',
  },
  getStartedBtn: {
    padding: '16px 50px',
    background: '#000',
    color: '#fff',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: '700',
    border: 'none',
    fontSize: '1.1rem',
    marginBottom: '20px',
  },
  section: {
    maxWidth: '1200px',
    margin: '0 auto 80px',
    padding: '0 20px',
    position: 'relative',
    zIndex: 2,
  },
  sectionTitle: {
    fontSize: '2.2rem',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: '50px',
    color: '#0f172a',
  },
  stepsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
  },
  stepCard: {
    background: 'white',
    padding: '40px 30px',
    borderRadius: '30px',
    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.3)',
    backdropFilter: 'blur(10px)',
  },
  stepNumber: {
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    color: 'white',
    fontSize: '1.8rem',
    fontWeight: '800',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 25px',
  },
  stepHeading: {
    fontSize: '1.3rem',
    fontWeight: '700',
    marginBottom: '15px',
    color: '#0f172a',
  },
  stepText: {
    color: '#475569',
    lineHeight: '1.6',
    fontSize: '1rem',
  },
  gridWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '30px',
  },
  footer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '80px',
    background: '#0f172a',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  footerText: {
    margin: '0 0 5px',
    fontSize: '0.9rem',
  },
  footerLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '25px',
  },
  footerLink: {
    color: '#cbd5e1',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'color 0.2s',
  },
};