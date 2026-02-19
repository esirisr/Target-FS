import React, { useState } from 'react';
import axios from 'axios';

export default function ProCard({ pro, onAction, userBookings = [] }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  const data = pro.professional || pro;
  const displayName = data.businessName || data.name || "Provider";
  const displaySkill = (data.skills && data.skills.length > 0) ? data.skills[0] : (data.businessCategory || "Professional");

  const bookingToRate = userBookings.find(b => 
    b.professional?._id === data._id && 
    (b.status === 'approved' || b.status === 'accepted') && 
    !b.rating
  );
  const canRate = !!bookingToRate;
  const averageRating = data.rating ? Number(data.rating).toFixed(1) : "0.0";

  const handleRate = async (val) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/bookings/rate', 
        { bookingId: bookingToRate._id, ratingValue: val }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onAction("Rating submitted! Thank you."); 
    } catch (err) {
      onAction("Error saving rating.", "error");
    }
  };

  const handleHire = async () => {
    const hasPending = userBookings.some(b => b.professional?._id === data._id && b.status === 'pending');
    if (hasPending) {
      onAction(`You already have a pending order for this ${displaySkill.toLowerCase()}!`, "error");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onAction("Please login first to hire professionals.", "error");
        return;
      }
      setIsBooking(true);
      await axios.post('http://localhost:5000/api/bookings/create', { proId: data._id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onAction("Hiring request sent successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || "";
      const errorMsg = msg.includes("limit") 
        ? `Daily limit reached for this ${displaySkill}.` 
        : "Booking failed. Please try again.";
      onAction(errorMsg, "error");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.card, 
        transform: isHovered ? 'translateY(-8px)' : 'none',
        boxShadow: isHovered ? '0 12px 25px rgba(0,0,0,0.1)' : '0 4px 15px rgba(0,0,0,0.05)'
      }}
    >
      <div style={styles.header}>
   
        <h2 style={styles.name}>{displayName}</h2>
        <div style={styles.skillTag}>{displaySkill}</div>
      </div>

      <div style={styles.infoSection}>
        {/* Increased font size for location and phone */}
        <div style={styles.infoPill}>📍 {data.location || "Hargeisa"}</div>
      </div>

      <div style={styles.footer}>
        
        {/* RATING SECTION: Now placed above the button */}
        <div style={styles.ratingSectionTop}>
          <div style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                onMouseEnter={() => canRate && setHoverStar(s)}
                onMouseLeave={() => canRate && setHoverStar(0)}
                onClick={() => canRate && handleRate(s)}
                style={{
                  ...styles.star,
                  color: s <= (hoverStar || Math.round(data.rating || 0)) ? '#f59e0b' : '#e2e8f0',
                  cursor: canRate ? 'pointer' : 'default',
                }}
              >★</span>
            ))}
          </div>
          <div style={styles.ratingLabel}>
            <strong>{averageRating}</strong> <span style={{color: '#94a3b8'}}>({data.reviewCount || 0} reviews)</span>
          </div>
          {canRate && <div style={styles.rateNowText}>Please rate your experience!</div>}
        </div>

        <div style={styles.availability}>
           Availability <span>{data.dailyRequestCount || 0}/3</span>
        </div>
        <div style={styles.progressBg}>
          <div style={{...styles.progressFill, width: `${((data.dailyRequestCount || 0) / 3) * 100}%`}} />
        </div>
        
        <button 
          onClick={handleHire}
          disabled={isBooking || data.dailyRequestCount >= 3}
          style={{
            ...styles.hireButton,
            backgroundColor: (isBooking || data.dailyRequestCount >= 3) ? '#94a3b8' : '#6366f1'
          }}
        >
          {data.dailyRequestCount >= 3 ? 'Limit Reached' : (isBooking ? 'Processing...' : `Hire ${displaySkill}`)}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: { 
    position: 'relative', 
    padding: '30px 25px', 
    borderRadius: '28px', 
    backgroundColor: '#fff', 
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
    display: 'flex', 
    flexDirection: 'column', 
    border: '1px solid #f1f5f9',
    textAlign: 'center'
  },
  header: { 
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  badge: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#10b981',
    backgroundColor: '#ecfdf5',
    padding: '4px 12px',
    borderRadius: '20px',
    marginBottom: '10px',
    display: 'inline-block'
  },
  name: { 
    fontSize: '1.55rem', 
    fontWeight: '900', 
    margin: '0 0 4px 0', 
    color: '#0f172a',
    letterSpacing: '-0.02em'
  },
  skillTag: { 
    fontSize: '12px', 
    color: '#4338ca', 
    fontWeight: '800', 
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  infoSection: { 
    marginBottom: '20px', 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  infoPill: {
    fontSize: '15px', // Increased font size as requested
    fontWeight: '600',
    color: '#334155',
    backgroundColor: '#f8fafc',
    padding: '8px 20px',
    borderRadius: '14px',
    width: 'fit-content',
    border: '1px solid #f1f5f9'
  },
  footer: { marginTop: 'auto' },
  // Rating styling for its new position
  ratingSectionTop: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  availability: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    fontSize: '12px', 
    color: '#64748b', 
    marginBottom: '8px', 
    fontWeight: '700',
    padding: '0 5px'
  },
  progressBg: { 
    height: '8px', 
    backgroundColor: '#f1f5f9', 
    borderRadius: '10px', 
    marginBottom: '20px', 
    overflow: 'hidden' 
  },
  progressFill: { 
    height: '100%', 
    background: 'linear-gradient(90deg, #6366f1, #818cf8)', 
    transition: 'width 0.5s ease-out' 
  },
  hireButton: { 
    width: '100%', 
    padding: '16px', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '18px', 
    fontSize: '15px',
    fontWeight: '800', 
    cursor: 'pointer', 
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
  },
  starRow: { 
    display: 'flex', 
    gap: '2px',
    marginBottom: '4px' 
  },
  star: {
    fontSize: '24px', // Slightly larger stars
    transition: 'transform 0.2s ease'
  },
  ratingLabel: { 
    fontSize: '14px', 
    color: '#1e293b' 
  },
  rateNowText: { 
    fontSize: '11px', 
    color: '#10b981', 
    fontWeight: '800', 
    marginTop: '5px',
    textTransform: 'uppercase'
  }
};