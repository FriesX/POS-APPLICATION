import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api'; // Import gateway
import Window from '../components/Window';
import '../App.css';

function EditUserPage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [formData, setFormData] = useState({
    username: '',
    password: '', // Note: In a real app, we usually don't send back the password hash
    name: '',
    role: 'user',
    pdfUrl: '',
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    // GET user data
    api.get(`/users/${username}`)
      .then(response => {
        setFormData(response.data);
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
    
    // UPDATE user data
    api.put(`/users/${username}`, { name, password, role })
      .then(() => {
        alert('User updated successfully!');
        navigate('/settings');
      })
      .catch(error => {
        alert('Update failed: ' + (error.response?.data?.message || error.message));
      });
  };

  const handlePdfUpload = () => {
    if (!file) {
      alert('Please select a PDF file first');
      return;
    }
    
    const uploadData = new FormData();
    uploadData.append('pdf-file', file);

    // UPLOAD PDF
    // We must override the 'Content-Type' for file uploads
    api.post(`/users/${username}/upload-pdf`, uploadData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(response => {
      alert('PDF uploaded successfully!');
      setFormData(prev => ({ ...prev, pdfUrl: response.data.url }));
      setFile(null);
    })
    .catch(error => {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + (error.response?.data?.message || error.message));
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
        {/* Ideally, password change should be a separate process, but keeping it here for now */}
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