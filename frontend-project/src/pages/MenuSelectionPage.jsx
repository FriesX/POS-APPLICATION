// src/pages/MenuSelectionPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // [1] Import useNavigate
import Window from '../components/Window';
import '../App.css';

function MenuSelectionPage({ user, onLogout }) {
  // [2] Initialize the hook
  const navigate = useNavigate();

  // Check if the user is an admin
  const isAdmin = user.role === 'admin';

  return (
    <Window title="Menu Selection">
      <div className="menu-container">
        {/* 1. EVERYONE can access Sales */}
        <button onClick={() => navigate('/sales')}>Sales</button>

        {/* 2. ONLY ADMINS can access these menus */}
        {isAdmin && (
          <>
            <button onClick={() => navigate('/accounting')}>Accounting</button>

            {/* Now 'navigate' exists, so these will work */}
            <button onClick={() => navigate('/inventory')}>
              Inventory
            </button>
            
            <button onClick={() => navigate('/settings')}>
              Settings
            </button>
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