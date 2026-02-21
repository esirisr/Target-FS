import React, { useState } from 'react';

export default function StarRating({ rating, onRate, readOnly = false }) {
  const [hover, setHover] = useState(0);

  return (
    <div style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hover || rating);

        return (
          <span
            key={star}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => !readOnly && onRate(star)}
            style={{
              ...styles.star,
              cursor: readOnly ? 'default' : 'pointer',
              color: isActive ? '#facc15' : '#e5e7eb',
              background: isActive 
                ? 'radial-gradient(circle at 50% 50%, #fde68a, #f59e0b)'
                : 'transparent',
              textShadow: isActive 
                ? '0 0 6px #fbbf24, 0 0 12px #f59e0b, 0 0 18px rgba(245,158,11,0.4)'
                : '0 0 2px rgba(0,0,0,0.1)',
              transform: hover === star ? 'scale(1.5) rotate(-5deg)' : 'scale(1) rotate(0deg)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: isActive ? 'drop-shadow(0 0 6px #fbbf24)' : 'none'
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

const styles = {
  container: { 
    display: 'flex', 
    gap: '8px', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: '10px 12px', 
    background: 'linear-gradient(145deg, #ffffff, #f3f4f6)',
    borderRadius: '16px', 
    boxShadow: '0 8px 16px rgba(0,0,0,0.08), inset 0 -2px 6px rgba(0,0,0,0.03)',
    width: 'max-content',
    margin: '0 auto',
    transition: 'all 0.3s ease',
  },
  star: { 
    fontSize: '28px', 
    userSelect: 'none', 
    display: 'inline-block',
  }
};