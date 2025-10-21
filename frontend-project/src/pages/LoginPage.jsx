// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import Window from '../components/Window';
import '../App.css';

// Menerima prop 'onLogin' dari App.jsx
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Panggil API backend
    axios.post('http://localhost:4000/api/login', { username, password })
      .then(response => {
        // Jika sukses, panggil 'onLogin' dengan data user dari server
        onLogin(response.data);
      })
      .catch(error => {
        console.error('Login gagal:', error);
        alert(error.response?.data?.message || 'Login gagal');
      });
  };

  return (
    <Window title="Login Page">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-login">
          Login
        </button>
      </form>
    </Window>
  );
}

export default LoginPage;