// src/pages/EditUserPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api'; // Using our centralized API
import Window from '../components/Window';
import '../App.css';

function EditUserPage() {
  const navigate = useNavigate();
  const { username } = useParams();
  
  // CLEANUP: Removed 'pdfUrl' from state as it's no longer used
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user', 
  });

  // CLEANUP: Removed 'file' state (const [file, setFile]...)

  useEffect(() => {
    api.get(`/users/${username}`)
      .then(response => {
        // We only grab the fields we care about now
        setFormData({
            username: response.data.username,
            password: response.data.password, 
            name: response.data.name,
            role: response.data.role
        });
      })
      .catch(error => {
        console.error('User fetch error:', error);
        alert('User not found');
        navigate('/settings');
      });
  }, [username, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, password, role } = formData;
    
    api.put(`/users/${username}`, { name, password, role })
      .then(() => {
        alert('User updated successfully!');
        navigate('/settings');
      })
      .catch(error => {
        console.error('Update failed:', error);
        alert('Update failed: ' + (error.response?.data?.message || error.message));
      });
  };

  // CLEANUP: Removed 'handlePdfUpload' function completely

  return (
    <Window title="Edit User">
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-controls">
          <button type="button" onClick={() => navigate('/settings')}>Back</button>
          <button type="submit">Save Changes</button>
        </div>
        
        <div className="form-group">
          <label>Username</label>
          <input name="username" value={formData.username} readOnly disabled />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Roles</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
      </form>
      {/* CLEANUP: The PDF Upload section <div className="pdf-upload-section"> is gone */}
    </Window>
  );
}

export default EditUserPage;