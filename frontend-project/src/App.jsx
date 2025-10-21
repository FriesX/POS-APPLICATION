// src/App.jsx
import React, { useState } from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import './App.css';

import LoginPage from './pages/LoginPage';
import MenuSelectionPage from './pages/MenuSelectionPage';
import SettingsPage from './pages/SettingsPage';
import NewUserPage from './pages/NewUserPage';
import EditUserPage from './pages/EditUserPage';

// Komponen helper untuk melindungi rute
function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Komponen helper untuk rute Admin
function AdminRoute({ user, children }) {
  // Logika disederhanakan: hanya cek 'admin'
  const isAdmin = user?.role === 'admin';
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (!isAdmin) {
    // Jika login tapi bukan admin, tendang ke menu
    return <Navigate to="/menu" replace />;
  }
  return children;
}

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* --- RUTE LOGIN --- */}
        <Route 
          path="/" 
          element={
            user ? <Navigate to="/menu" /> : <LoginPage onLogin={handleLogin} />
          } 
        />

        {/* --- RUTE MENU (Protected) --- */}
        <Route 
          path="/menu" 
          element={
            <ProtectedRoute user={user}>
              <MenuSelectionPage user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        {/* --- RUTE ADMIN (Protected & Admin Only) --- */}
        <Route 
          path="/settings" 
          element={
            <AdminRoute user={user}>
              <SettingsPage />
            </AdminRoute>
          } 
        />
        <Route 
          path="/settings/new" 
          element={
            <AdminRoute user={user}>
              <NewUserPage />
            </AdminRoute>
          } 
        />
        <Route 
          path="/settings/edit/:username" 
          element={
            <AdminRoute user={user}>
              <EditUserPage />
            </AdminRoute>
          } 
        />

        {/* Rute cadangan */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;