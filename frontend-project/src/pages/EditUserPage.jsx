// src/pages/EditUserPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Window from '../components/Window';
import '../App.css';

function EditUserPage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user', // Default 'user' selagi loading
    pdfUrl: '',
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:4000/api/users/${username}`)
      .then(response => {
        setFormData(response.data);
      })
      .catch(error => {
        console.error('Gagal mengambil data user:', error);
        alert('User tidak ditemukan');
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
    axios.put(`http://localhost:4000/api/users/${username}`, { name, password, role })
      .then(() => {
        alert('User berhasil diupdate!');
        navigate('/settings');
      })
      .catch(error => {
        console.error('Gagal mengupdate user:', error);
        alert('Gagal mengupdate user: ' + (error.response?.data?.message || error.message));
      });
  };

  const handlePdfUpload = () => {
    // ... (Fungsi ini tidak berubah) ...
    if (!file) {
      alert('Pilih file PDF terlebih dahulu');
      return;
    }
    const uploadData = new FormData();
    uploadData.append('pdf-file', file);
    axios.post(`http://localhost:4000/api/users/${username}/upload-pdf`, uploadData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(response => {
      alert('PDF berhasil di-upload!');
      setFormData(prev => ({ ...prev, pdfUrl: response.data.url }));
      setFile(null);
    })
    .catch(error => {
      console.error('Gagal upload PDF:', error);
      alert('Gagal upload PDF: ' + (error.response?.data?.message || error.message));
    });
  };

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
          
          {/* ATURAN #2: Ubah opsi select */}
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="user">user</option>
            <option value="admin">admin</option>
            {/* Opsi 'Developer' dihapus */}
          </select>
        </div>
      </form>

      {/* Bagian Upload PDF (Tidak berubah) */}
      <div className="pdf-upload-section">
        <hr />
        <h4>Manage PDF</h4>
        {formData.pdfUrl && (
          <div className="form-group">
            <label>Current PDF:</label>
            <a href={formData.pdfUrl} target="_blank" rel="noopener noreferrer">
              View/Download PDF
            </a>
          </div>
        )}
        <div className="form-group">
          <label>{formData.pdfUrl ? 'Upload New (Replace)' : 'Upload PDF'}</label>
          <input 
            type="file" 
            accept=".pdf" 
            onChange={(e) => setFile(e.target.files[0])} 
          />
        </div>
        <button onClick={handlePdfUpload} disabled={!file}>
          Upload PDF
        </button>
      </div>
    </Window>
  );
}

export default EditUserPage;