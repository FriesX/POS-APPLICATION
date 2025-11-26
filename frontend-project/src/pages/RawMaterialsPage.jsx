import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Window from '../components/Window';
import '../App.css';

function RawMaterialsPage() {
    const navigate = useNavigate();
    const [materials, setMaterials] = useState([]);

    // Fetch data on load
    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const response = await api.get('/raw-materials');
            setMaterials(response.data);
        } catch (error) {
            console.error('Error fetching materials:', error);
        }
    };

    // Helper to determine status based on stock logic
    const getStatus = (stock, minStock) => {
        if (stock <= 0) return <span style={{ color: 'red' }}>Out of Stock</span>;
        if (stock <= minStock) return <span style={{ color: 'orange' }}>Low Stock</span>;
        return <span style={{ color: 'green' }}>OK</span>;
    };

    return (
        <Window title="Raw Materials">
            <div className="inventory-controls">
                <button onClick={() => navigate('/inventory')}>Back</button>
                <button onClick={() => navigate('/inventory/raw-materials/new')}>New Material</button>
                <button disabled>Edit Material</button>
                <button disabled>Delete Material</button>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Item Code</th>
                            <th>Item Name</th>
                            <th>Stock</th>
                            <th>Unit</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>No materials found. Add one!</td>
                            </tr>
                        ) : (
                            materials.map((item) => (
                                <tr key={item._id}>
                                    <td>
                                        {/* The + Button */}
                                        <button
                                            style={{ marginRight: '5px', fontWeight: 'bold' }}
                                            onClick={() => navigate(`/inventory/raw-materials/${item.itemCode}`)}
                                        >
                                            +
                                        </button>
                                        {item.itemCode}
                                    </td>
                                    <td>{item.itemCode}</td>
                                    <td>{item.itemName}</td>
                                    <td>{item.stock}</td>
                                    <td>{item.unit}</td>
                                    <td>{getStatus(item.stock, item.minStock)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Window>
    );
}

export default RawMaterialsPage;