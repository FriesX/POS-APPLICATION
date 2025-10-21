import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Window from '../components/Window';
import '../App.css';

// Komponen dimulai di sini
function SettingsPage() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Fungsi untuk mengambil data user dari server
  const fetchUsers = () => {
    axios.get('http://localhost:4000/api/users')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Gagal mengambil data users:', error);
      });
  };

  // Panggil fetchUsers() saat komponen pertama kali dimuat
  useEffect(() => {
    fetchUsers();
  }, []);

  // FUNGSI PENGHAPUSAN
  // Didefinisikan DI DALAM komponen SettingsPage
  const handleDelete = (username) => {
    // Tampilkan dialog konfirmasi untuk keamanan
    if (window.confirm(`Anda yakin ingin menghapus user "${username}"?`)) {
      axios.delete(`http://localhost:4000/api/users/${username}`)
        .then(response => {
          alert(response.data.message);
          // Panggil ulang fetchUsers() untuk mendapatkan data terbaru dari server
          fetchUsers(); 
        })
        .catch(error => {
          console.error('Gagal menghapus user:', error);
          alert('Gagal menghapus user: ' + (error.response?.data?.message || 'Error tidak diketahui'));
        });
    }
  };

  // Bagian return juga berada DI DALAM komponen SettingsPage
  return (
    <Window title="Settings">
      <div className="settings-controls">
        <button onClick={() => navigate('/menu')}>Back</button>
        <button onClick={() => navigate('/settings/new')}>New User</button>
      </div>
      
      <table className="user-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Name</th>
            <th>Password</th>
            <th>Rules</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.username}>
              <td>{user.username}</td>
              <td>{user.name}</td>
              <td>{user.passwordDisplay}</td>
              <td>{user.role}</td>
              <td className="actions-cell">
                <Link to={`/settings/edit/${user.username}`}>
                  ✏️
                </Link>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDelete(user.username)}
                  disabled={user.username === 'admin'} 
                >
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Window>
  );
// Komponen berakhir di sini
}

export default SettingsPage;

