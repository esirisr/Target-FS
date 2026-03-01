import React from 'react';

const About = () => {
  return (
    <div className="info-container">
      <div className="glass-card">
        <h2 className="section-title">
          Disclaimer – Expert<span>at</span> Hub
        </h2>

        <p className="description">
          Expert<span>at</span> Hub operates strictly as a digital platform that connects
          clients with independent home maintenance professionals. We do not employ,
          manage, supervise, or directly control the service providers listed on this platform.
        </p>

        <p className="description">
          The platform is solely responsible for facilitating communication between
          customers and professionals. Any agreements, services performed,
          payments arranged, or actions taken by service providers are the full
          responsibility of the respective professional and the client involved.
        </p>

        <p className="description">
          Expert<span>at</span> Hub shall not be held liable for misconduct, negligence,
          damages, disputes, or any inappropriate behavior resulting from services
          arranged through this platform.
        </p>

        <div className="contact-info-mini" style={{marginTop: "30px"}}>
  
          <p><strong>Location:</strong> Hargeisa, Somalia</p>
        </div>
      </div>
    </div>
  );
};

export default About;
