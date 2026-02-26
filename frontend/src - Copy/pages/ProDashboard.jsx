import React, { useEffect, useState } from "react";
import { fetchAnalytics } from "../services/api";
import KpiCard from "../components/KpiCard";

const ProDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAnalytics();
        setData(res);
      } catch (err) {
        setError("Failed to load professional metrics.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="pro-loader">Loading Professional Hub...</div>;
  if (error) return <div className="pro-error">{error}</div>;

  return (
    <div className="pro-bg">
      <style>{`
        .pro-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
          padding: 40px 20px;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .pro-container {
          max-width: 1100px;
          margin: 0 auto;
          background: white;
          border-radius: 32px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          padding: 40px;
        }

        .pro-header {
          margin-bottom: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pro-header h2 {
          color: #4338ca;
          font-size: 1.8rem;
          margin: 0;
          font-weight: 800;
        }

        /* KPI Layout */
        .pro-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        /* Demand Section */
        .market-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          border-top: 1px solid #f1f5f9;
          padding-top: 32px;
        }

        .section-label {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
          display: block;
        }

        .demand-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f8fafc;
        }

        .city-name {
          text-transform: capitalize;
          font-weight: 600;
          color: #475569;
        }

        .count-badge {
          background: #eef2ff;
          color: #4f46e5;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        /* Performance Bar */
        .coverage-bar-container {
          background: #f1f5f9;
          height: 10px;
          border-radius: 5px;
          margin-top: 10px;
          overflow: hidden;
        }

        .coverage-bar-fill {
          height: 100%;
          background: #6366f1;
          transition: width 1s ease-in-out;
        }
      `}</style>

      <div className="pro-container">
        <header className="pro-header">
          <div>
            <h2>Professional Hub</h2>
            <p style={{ color: '#64748b', margin: '4px 0' }}>Market analysis and performance metrics</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="count-badge">Status: Active</span>
          </div>
        </header>

        <div className="pro-grid">
          <KpiCard title="Market Bookings" value={data?.totalBookings} />
          <KpiCard title="Your Coverage" value={`${data?.metrics?.proCoverage}%`} />
          <KpiCard title="Avg Rating" value={data?.metrics?.averagePlatformRating || "5.0"} />
          <KpiCard title="Active Regions" value={data?.usersPerLocation?.length} />
        </div>

        <div className="market-section">
          {/* Market Demand List */}
          <div>
            <span className="section-label">Demand by Location</span>
            {data?.usersPerLocation?.map((loc) => (
              <div key={loc._id} className="demand-item">
                <span className="city-name">{loc._id || "Other"}</span>
                <span className="count-badge">{loc.count} Requests</span>
              </div>
            ))}
          </div>

          {/* Professional Competition Insight */}
          <div>
            <span className="section-label">Pro Density & Skill Supply</span>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
              Showing total skill saturation per region to help you find gaps in the market.
            </p>
            {data?.skillCountPerLocation?.map((loc) => (
              <div key={loc._id} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span style={{ textTransform: 'capitalize' }}>{loc._id}</span>
                  <span>{loc.totalSkills} Active Pros</span>
                </div>
                <div className="coverage-bar-container">
                  <div 
                    className="coverage-bar-fill" 
                    style={{ width: `${(loc.totalSkills / 100) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProDashboard;