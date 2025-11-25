import React, { useState } from 'react';
import api from '../api'; // Import our new gateway
import Window from '../components/Window';
import '../App.css';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Added error state for better UX

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // CLEAN CODE: No more 'http://localhost...'
      const response = await api.post('/login', { username, password });
      onLogin(response.data);
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Window title="Login Page">
      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div className="error-message" style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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