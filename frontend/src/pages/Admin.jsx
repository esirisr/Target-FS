import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminCard from '../components/AdminCard';

export default function Admin() {
  const [data, setData] = useState({ allPros: [], stats: {} });
  const [loading, setLoading] = useState(true);
  
  // New States for UI feedback
  const [notification, setNotification] = useState({ msg: '', type: '' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://tsbe-production.up.railway.app/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error("Admin Load Error:", err);
      showNotification("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: '', type: '' }), 4000);
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (id, type) => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    try {
      if (type === 'verify') {
        await axios.patch(`https://tsbe-production.up.railway.app/api/admin/verify/${id}`, {}, config);
        showNotification("Professional verified successfully!");
      } else if (type === 'suspend') {
        await axios.patch(`https://tsbe-production.up.railway.app/api/admin/toggle-suspension/${id}`, {}, config);
        showNotification("Suspension status toggled.");
      } else if (type === 'delete') {
        // Trigger our custom modal instead of window.confirm
        setConfirmDelete({ show: true, id });
        return; 
      }
      
      loadData(); 
    } catch (err) {
      showNotification(err.response?.data?.message || "Action failed!", "error");
    }
  };

  const executeDelete = async () => {
    const { id } = confirmDelete;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://tsbe-production.up.railway.app/api/admin/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification("Account permanently deleted.", "success");
      setConfirmDelete({ show: false, id: null });
      loadData();
    } catch (err) {
      showNotification("Delete failed", "error");
    }
  };

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Loading Console...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', position: 'relative' }}>
      
      {/* --- FLOATING NOTIFICATION --- */}
      {notification.msg && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          padding: '12px 25px', color: '#fff', borderRadius: '8px', zIndex: 2000,
          backgroundColor: notification.type === 'error' ? '#ef4444' : '#0f172a',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)', fontWeight: 'bold'
        }}>
          {notification.msg}
        </div>
      )}

      {/* --- CUSTOM CONFIRMATION MODAL --- */}
      {confirmDelete.show && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.content}>
            <h3>Confirm Deletion</h3>
            <p>This action cannot be undone. Are you sure?</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={executeDelete} style={modalStyles.deleteBtn}>Yes, Delete</button>
              <button onClick={() => setConfirmDelete({ show: false, id: null })} style={modalStyles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <h1 style={{fontWeight: '900', fontSize: '2rem', marginBottom: '30px'}}>Management Console</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
        {data.allPros.map(pro => (
          <AdminCard key={pro._id} pro={pro} onAction={handleAction} />
        ))}
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 },
  content: { backgroundColor: '#fff', padding: '30px', borderRadius: '16px', textAlign: 'center', maxWidth: '400px', width: '90%'},
  deleteBtn: { flex: 1, padding: '12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { flex: 1, padding: '12px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};
