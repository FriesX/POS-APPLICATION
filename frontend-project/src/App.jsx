import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// --- EXISTING PAGES ---
import LoginPage from './pages/LoginPage';
import MenuSelectionPage from './pages/MenuSelectionPage';

// --- POTENTIALLY MISSING/BROKEN PAGES ---
// If any of these files are missing or have errors, the whole app turns white.
// We will wrap them in a try-catch logic concept, but for now, ensure these imports are correct.
import SettingsPage from './pages/SettingsPage';
import NewUserPage from './pages/NewUserPage';
import EditUserPage from './pages/EditUserPage';
import InventoryMenuPage from './pages/InventoryMenuPage';
import RawMaterialsPage from './pages/RawMaterialsPage';
import NewMaterialPage from './pages/NewMaterialPage';
import MaterialPurchasePage from './pages/MaterialPurchasePage';
import NewPurchasePage from './pages/NewPurchasePage';

// --- HELPER COMPONENTS ---
function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function AdminRoute({ user, children }) {
  const isAdmin = user?.role === 'admin';
  if (!user) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/menu" replace />;
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
        {/* LOGIN */}
        <Route
          path="/"
          element={user ? <Navigate to="/menu" /> : <LoginPage onLogin={handleLogin} />}
        />

        {/* MENU */}
        <Route
          path="/menu"
          element={
            <ProtectedRoute user={user}>
              <MenuSelectionPage user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* SETTINGS (Admin) */}
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

        {/* INVENTORY (Admin) - FIXED: Passing 'user' prop just in case */}
        <Route
          path="/inventory"
          element={
            <AdminRoute user={user}>
              <InventoryMenuPage user={user} />
            </AdminRoute>
          }
        />
        <Route
          path="/inventory/raw-materials"
          element={
            <AdminRoute user={user}>
              <RawMaterialsPage user={user} />
            </AdminRoute>
          }
        />
        <Route
          path="/inventory/raw-materials/new"
          element={
            <AdminRoute user={user}>
              <NewMaterialPage user={user} />
            </AdminRoute>
          }
        />

        <Route path="/inventory/raw-materials/:itemCode" element={<MaterialPurchasePage />} />
        <Route path="/inventory/raw-materials/:itemCode/new-purchase" element={<NewPurchasePage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;