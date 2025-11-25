import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Window from '../components/Window';
import '../App.css';

function NewMaterialPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        itemName: '',
        stock: 0,
        unit: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send data to backend (Backend handles RMxxx generation)
            await api.post('/raw-materials', formData);
            alert('Material Added Successfully!');
            navigate('/inventory/raw-materials');
        } catch (error) {
            console.error('Error adding material:', error);
            alert('Failed to add material');
        }
    };

    return (
        <Window title="New Raw Material">
            <form onSubmit={handleSubmit} className="user-form">
                <div className="form-controls">
                    <button type="button" onClick={() => navigate('/inventory/raw-materials')}>
                        Cancel
                    </button>
                    <button type="submit">Add Material</button>
                </div>

                <div className="form-group">
                    <label>Item Code</label>
                    <input
                        type="text"
                        value="Auto-Generated (RMxxx)"
                        disabled
                        style={{ backgroundColor: '#e0e0e0', fontStyle: 'italic' }}
                    />
                </div>

                <div className="form-group">
                    <label>Item Name</label>
                    <input
                        name="itemName"
                        value={formData.itemName}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Flour, Sugar"
                    />
                </div>

                <div className="form-group">
                    <label>Initial Stock</label>
                    <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Unit</label>
                    <select name="unit" value={formData.unit} onChange={handleChange} required>
                        <option value="">-- Select Unit --</option>
                        <option value="kg">kg</option>
                        <option value="gr">gr</option>
                        <option value="liter">liter</option>
                        <option value="pcs">pcs</option>
                        <option value="sack">sack</option>
                    </select>
                </div>
            </form>
        </Window>
    );
}

export default NewMaterialPage;