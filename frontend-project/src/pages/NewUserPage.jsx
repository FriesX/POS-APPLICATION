// src/pages/NewUserPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Window from '../components/Window';
import '../App.css';

function NewUserPage() {
  const navigate = useNavigate();
  
  // ATURAN #1: Set 'role' default ke 'user'
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user', // Diubah dari 'Normal'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:4000/api/users', formData)
      .then(() => {
        alert('User baru berhasil dibuat!');
        navigate('/settings'); // Kembali ke halaman settings
      })
      .catch(error => {
        console.error('Gagal membuat user:', error);
        alert('Gagal membuat user: ' + (error.response?.data?.message || error.message));
      });
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
          
          {/* ATURAN #2: Ubah opsi select */}
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="user">user</option>
            <option value="admin">admin</option>
            {/* Opsi 'Developer' dihapus */}
          </select>
        </div>
      </form>
    </Window>
  );
}

export default NewUserPage;