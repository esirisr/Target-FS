import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import image1 from '../assets/1.jpg';
import image2 from '../assets/2.jpg';
import image3 from '../assets/3.jpg';

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Slider Logic (Untouched)
  const [currentImage, setCurrentImage] = useState(0);
  const images = [image1, image2, image3];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const handleCTA = () => {
    if (!token) return navigate('/login');
    if (role === 'admin') return navigate('/admin');
    if (role === 'pro') return navigate('/pro-dashboard');
    return navigate('/client-home');
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Background Image Slider */}
      {images.map((img, index) => (
        <div
          key={index}
          style={{
            ...styles.bgImage,
            backgroundImage: `url(${img})`,
            opacity: currentImage === index ? 1 : 0,
          }}
        />
      ))}
      
      {/* Overlay - Layered between Image and Content */}
      <div style={styles.overlay} />

      {/* Content */}
      <div style={styles.contentContainer}>
        <h1 style={styles.subLogo}>HOME-MAN</h1>
        <h2 style={styles.motto}>
          Expert Hands. Local Heart. <br />
          <span style={{ color: '#3b82f6' }}>Home Services Simplified.</span>
        </h2>
        
        <p style={styles.subText}>
          Your one-stop destination for reliable, professional home maintenance. 
          From leaking pipes to complex wiring, we’ve got you covered.
        </p>

        <button
          onClick={handleCTA}
          style={styles.ctaButton}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.backgroundColor = '#2563eb';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.backgroundColor = '#1d4ed8';
          }}
        >
          {token ? 'Back to Dashboard' : 'Get Started'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    position: 'relative',
    height: '100vh',
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: '#000', // Provides a base if images take a second to load
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'opacity 1.5s ease-in-out',
    zIndex: 1, // Base layer
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    // Switched to a dark-to-light gradient for a more modern look
    backgroundColor: 'rgba(255, 255, 255, 0.80)', 
    zIndex: 2, // Sits on top of images
  },
  contentContainer: {
    position: 'relative', // Ensures it stays above the absolute elements
    textAlign: 'center',
    padding: '0 20px',
    maxWidth: '900px',
    zIndex: 3, // Sits on top of the overlay
  },
  subLogo: { 
    fontSize: 'clamp(12px, 2vw, 16px)', 
    letterSpacing: '5px', 
    color: '#64748b', 
    textTransform: 'uppercase',
    marginBottom: '20px' 
  },
  motto: { 
    fontSize: 'clamp(1.8rem, 6vw, 4.5rem)', 
    fontWeight: '900', 
    margin: '0 0 20px 0', 
    lineHeight: '1.1',
    color: '#0f172a'
  },
  subText: {
    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
    color: '#475569',
    marginBottom: '40px',
    maxWidth: '600px',
    marginInline: 'auto'
  },
  ctaButton: { 
    padding: 'clamp(15px, 3vw, 20px) clamp(30px, 6vw, 50px)', 
    backgroundColor: '#1d4ed8', 
    color: '#fff', 
    borderRadius: '50px', 
    cursor: 'pointer', 
    fontWeight: 'bold', 
    fontSize: 'clamp(16px, 3vw, 20px)', 
    border: 'none', 
    transition: 'all 0.3s ease', 
    boxShadow: '0 10px 25px rgba(29, 78, 216, 0.3)' 
  }
};