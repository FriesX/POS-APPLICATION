// src/pages/MenuSelectionPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Window from '../components/Window';
import '../App.css';

function MenuSelectionPage({ user, onLogout }) {
  // Check if the user is an admin
  const isAdmin = user.role === 'admin';

  return (
    <Window title="Menu Selection">
      <div className="menu-container">
        {/* 1. EVERYONE can access Sales */}
        <button>Sales</button>

        {/* 2. ONLY ADMINS can access these menus */}
        {isAdmin && (
          <>
            <button>Accounting</button>
            <button>Inventory</button>
            
            <Link to="/settings" className="button-link">
              Settings
            </Link>
          </>
        )}

        <button className="btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </Window>
  );
}

export default MenuSelectionPage;