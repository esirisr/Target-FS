import React from 'react';

const Contacts = () => {
  return (
    <div className="info-container animate-fade-in">
      <div className="glass-card">
        <h2 className="section-title">La Xiriir (Contacts)</h2>
        <p className="subtitle">Expertat Hub Support Team</p>

        <div className="contact-grid">

          <div className="contact-item">
            <span className="icon">📍</span>
            <div>
              <strong>Service Center</strong>
              <p>Hargeisa, Somalia</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="icon">📞</span>
            <div>
              <strong>Phone Support</strong>
              <p>+252 63 456 7890</p>
              <p>+252 65 123 4567</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="icon">✉️</span>
            <div>
              <strong>Email Support</strong>
              <p>support@expertathub.com</p>
              <p>info@expertathub.com</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="icon">🆔</span>
            <div>
              <strong>Support ID</strong>
              <p>Agent 377 266</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="icon">💼</span>
            <div>
              <strong>LinkedIn</strong>
              <p>linkedin.com/company/expertathub</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="icon">📘</span>
            <div>
              <strong>Facebook</strong>
              <p>facebook.com/expertathub</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="icon">💬</span>
            <div>
              <strong>WhatsApp</strong>
              <p>+252 63 456 7890</p>
            </div>
          </div>

        </div>

        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="Gali magacaaga..."
            />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea
              className="input-field"
              rows="4"
              placeholder="Sidee baan kuu caawin karnaa?"
            ></textarea>
          </div>

          <button type="submit" className="nav-btn admin-glow">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contacts;
