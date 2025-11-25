import React from 'react';
import { useNavigate } from 'react-router-dom';
import Window from '../components/Window';
import '../App.css';

function InventoryMenuPage() {
    const navigate = useNavigate();

    return (
        <Window title="Inventory Menu">
            <div className="menu-container">
                {/* Button 1: Raw Materials */}
                <button onClick={() => navigate('/inventory/raw-materials')}>
                    Raw Materials
                </button>

                {/* Button 2: Finished Goods (Placeholder for now) */}
                <button disabled style={{ opacity: 0.5 }}>
                    Finished Goods (Soon)
                </button>

                <button className="btn-logout" onClick={() => navigate('/menu')}>
                    Back to Menu
                </button>
            </div>
        </Window>
    );
}

export default InventoryMenuPage;