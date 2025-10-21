// src/pages/MenuSelectionPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Window from '../components/Window';
import '../App.css';

function MenuSelectionPage({ user, onLogout }) {
  // Logika disederhanakan: hanya cek 'admin'
  const isAdmin = user.role === 'admin';

  return (
    <Window title="Menu Selection">
      <div className="menu-container">
        <button>Sales</button>
        <button>Accounting</button>
        <button>Inventory</button>

        {/* Render kondisional berdasarkan 'isAdmin' */}
        {isAdmin && (
          <Link to="/settings" className="button-link">
            Settings
          </Link>
        )}

        <button className="btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </Window>
  );
}

export default MenuSelectionPage;