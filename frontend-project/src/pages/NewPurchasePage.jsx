import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import Window from '../components/Window';
import '../App.css';

function NewPurchasePage() {
  const navigate = useNavigate();
  const { itemCode } = useParams();
  
  const [formData, setFormData] = useState({
    qty: '',
    priceTotal: '',
    vendor: '-'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/raw-materials/${itemCode}/purchases`, formData);
      alert('Purchase Added Successfully!');
      navigate(`/inventory/raw-materials/${itemCode}`);
    } catch (error) {
      console.error(error);
      alert('Failed to add purchase');
    }
  };

  return (
    <Window title={`New Purchase: ${itemCode}`}>
      <form onSubmit={handleSubmit} className="user-form">
        <div className="inventory-controls">
          <button type="button" onClick={() => navigate(`/inventory/raw-materials/${itemCode}`)}>
            Cancel
          </button>
          <button type="submit">Confirm Purchase</button>
        </div>

        <div className="form-group">
          <label>Purchase ID</label>
          <input 
            value="Auto-Generated (e.g. RMxxx_001)" 
            disabled 
          />
        </div>

        <div className="form-group">
          <label>Quantity Bought</label>
          <input 
            type="number" 
            name="qty" 
            value={formData.qty} 
            onChange={handleChange} 
            required 
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label>Total Price (Rp)</label>
          <input 
            type="number" 
            name="priceTotal" 
            value={formData.priceTotal} 
            onChange={handleChange} 
            required 
            placeholder="e.g. 150000"
          />
        </div>

        <div className="form-group">
          <label>Vendor</label>
          <input 
            type="text" 
            name="vendor" 
            value={formData.vendor} 
            onChange={handleChange} 
            placeholder="Optional"
          />
        </div>
      </form>
    </Window>
  );
}

export default NewPurchasePage;