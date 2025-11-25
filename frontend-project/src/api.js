// src/api.js
import axios from 'axios';

// Create a single, powerful Axios instance
const api = axios.create({
  // This automatically adds 'http://localhost:4000/api' to every request
  baseURL: 'http://localhost:4000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;