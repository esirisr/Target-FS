import React, { useState } from 'react';

export default function StarRating({ rating, onRate, readOnly = false }) {
  const [hover, setHover] = useState(0);

  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onRate(star)}
          style={{
            fontSize: '18px',
            cursor: readOnly ? 'default' : 'pointer',
            color: star <= (hover || rating) ? '#f59e0b' : '#e2e8f0',
            transition: 'color 0.2s'
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}