import React, { useState, useEffect } from 'react';
import { addStudent, updateStudent } from '../services/fun';

export default function AddStudentForm({ onSuccess, editingStudent, setEditingStudent }) {
  const [form, setForm] = useState({
    name: '',
    number: '',
    location: '',
    skill: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync form with editingStudent when Edit is clicked
  useEffect(() => {
    if (editingStudent) {
      setForm(editingStudent);
    } else {
      setForm({ name: '', number: '', location: '', skill: '' });
    }
  }, [editingStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingStudent) {
        await updateStudent(editingStudent._id, form);
      } else {
        await addStudent(form);
      }
      // Reset
      setForm({ name: '', number: '', location: '', skill: '' });
      setEditingStudent(null);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrapper">
   
      <form onSubmit={submit} className="form-layout">
        <div className="input-group">
          <label className="label-text">Full Name</label>
          <input 
            className="input-field"
            name="name" 
            placeholder="e.g. Ahmedat" 
            value={form.name} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="input-group">
          <label className="label-text">Phone Number</label>
          <input 
            className="input-field"
            name="number" 
            placeholder="2526..." 
            value={form.number} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="input-group">
          <label className="label-text">Location</label>
          <input 
            className="input-field"
            name="location" 
            placeholder="Hargeisa" 
            value={form.location} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="input-group">
          <label className="label-text">Expertise</label>
          <select className="input-field" name="skill" value={form.skill} onChange={handleChange} required>
            <option value="">Select Skill</option>
            <option value="Plumber">Plumber</option>
            <option value="Electrician">Electrician</option>
            <option value="Carpenter">Carpenter</option>
            <option value="Painter">Painter</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className={`btn-submit ${editingStudent ? 'update' : 'add'}`}>
            {loading ? '...' : editingStudent ? 'Update Profile' : 'Register Provider'}
          </button>
          
          {editingStudent && (
            <button type="button" onClick={() => setEditingStudent(null)} className="btn-cancel">
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}