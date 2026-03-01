import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import image1 from '../assets/1.jpg';
import image2 from '../assets/2.jpg';
import image3 from '../assets/3.jpg';

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [currentImage, setCurrentImage] = useState(0);
  const images = [image1, image2, image3];

  useEffect(() => {
    // Force the body to hide overflow when this component mounts
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    
    return () => {
      clearInterval(timer);
      document.body.style.overflow = 'auto'; // Re-enable if user leaves home
    };
  }, [images.length]);

  const handleCTA = () => {
    if (!token) return navigate('/login');
    if (role === 'admin') return navigate('/admin');
    if (role === 'pro') return navigate('/pro-dashboard');
    return navigate('/client-home');
  };

  const getButtonText = () => {
    if (!token) return 'Get Started';
    if (role === 'pro') return 'Go to Workspace';
    if (role === 'admin') return 'Go to Management';
    return 'Go to Marketplace';
  };

  return (
    <div style={styles.pageWrapper}>
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
      <div style={styles.overlay} />

      <div style={styles.contentContainer}>
        <h1 style={styles.subLogo}>HOME-MAN</h1>
        <h2 style={styles.motto}>
          Expert Hands. Local Heart. <br />
          <span style={{ color: '#0059FF' }}>Home Services Simplified.</span>
        </h2>
        
        <button onClick={handleCTA} style={styles.ctaButton}>
          {getButtonText()}
        </button>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    position: 'fixed', // Using fixed to lock it to the screen edges
    top: 0,
    left: 0,
    height: '100vh',
    width: '100vw',
    overflow: 'hidden', // Ensures no scrollbar inside the div
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
    backgroundColor: '#000',
    margin: 0,
    padding: 0,
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
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.82)', 
    zIndex: 2,
  },
  contentContainer: { 
    position: 'relative', 
    textAlign: 'center', 
    padding: '0 20px', 
    maxWidth: '900px', 
    zIndex: 3,
    marginTop: '-5vh' // Pulls content up slightly to counteract visual "heaviness" at the bottom
  },
  subLogo: { fontSize: '1rem', letterSpacing: '5px', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px', fontWeight: '900' },
  motto: { fontSize: 'clamp(2rem, 8vw, 4.5rem)', fontWeight: '900', margin: '0 0 30px 0', lineHeight: '1.1', color: '#0f172a' },
  ctaButton: { 
    padding: '18px 45px', 
    backgroundColor: '#0059FF', 
    color: '#fff', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: '900', 
    fontSize: '1.1rem', 
    border: 'none', 
    boxShadow: '0 10px 25px rgba(0, 89, 255, 0.3)',
    textTransform: 'uppercase',
    transition: 'transform 0.2s ease'
  }
};