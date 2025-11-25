import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Import gateway
import Window from '../components/Window';
import '../App.css';

function NewUserPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user', 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // CLEAN CODE: sending data to /users
      await api.post('/users', formData);
      alert('User successfully created!');
      navigate('/settings');
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <Window title="New User">
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-controls">
          <button type="button" onClick={() => navigate('/settings')}>Back</button>
          <button type="submit">Confirm</button>
        </div>
        
        <div className="form-group">
          <label>Username</label>
          <input name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Roles</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
      </form>
    </Window>
  );
}

export default NewUserPage;