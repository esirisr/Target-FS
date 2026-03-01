import React from 'react';
import { deleteStudent } from '../services/fun';

export default function StudentList({ students, loading, onRefresh, onEdit, isAdmin }) {
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await deleteStudent(id);
      onRefresh();
    } catch (err) {
      alert('Server error while deleting');
    }
  };

  if (loading) return <div className="state-message">Loading professional database...</div>;
  if (!students.length) return <div className="state-message">No records found.</div>;

  return (
    <div className="grid-container">
      {students.map((s) => (
        <div key={s._id} className="student-card">
          <div className="card-header-row">
            <div className="avatar">
              {s.name.charAt(0).toUpperCase()}
            </div>
            <span className="skill-badge">{s.skill}</span>
          </div>

          <div className="card-content">
            <h2 className="user-name">{s.name}</h2>
            <div className="accent-line"></div>
            
            <div className="data-row">
              <span className="data-icon">📍</span>
              <span className="data-text">{s.location}</span>
            </div>
            
            <div className="data-row">
              <span className="data-icon">📞</span>
              <span className="data-text">{s.number}</span>
            </div>
          </div>

          {/* ONLY SHOW ACTIONS IF isAdmin IS TRUE */}
          {isAdmin && (
            <div className="card-actions">
              <button onClick={() => onEdit(s)} className="btn-edit-card">
                Edit
              </button>
              <button onClick={() => handleDelete(s._id)} className="btn-delete-card">
                🗑️
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}