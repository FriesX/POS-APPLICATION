import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import Window from '../components/Window';
import '../App.css';

function MaterialPurchasePage() {
  const navigate = useNavigate();
  const { itemCode } = useParams();
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    // Fetch Purchase History
    api.get(`/raw-materials/${itemCode}/purchases`)
      .then(res => setPurchases(res.data))
      .catch(err => console.error(err));
  }, [itemCode]);

  // --- CALCULATIONS ---
  const totalQtyBought = purchases.reduce((acc, curr) => acc + curr.qty, 0);
  const totalPriceAll = purchases.reduce((acc, curr) => acc + curr.priceTotal, 0);
  const averagePrice = totalQtyBought > 0 ? (totalPriceAll / totalQtyBought) : 0;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <Window title={`History: ${itemCode}`}>
      {/* 1. Header Stats */}
      <div className="stats-header">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div><strong>Item Code:</strong> {itemCode}</div>
          <div><strong>Total Qty:</strong> {totalQtyBought}</div>
          <div><strong>Total Spent:</strong> {formatRupiah(totalPriceAll)}</div>
          <div><strong>Avg Price:</strong> {formatRupiah(averagePrice)} / unit</div>
        </div>
      </div>

      {/* 2. Controls */}
      <div className="inventory-controls">
        <button onClick={() => navigate('/inventory/raw-materials')}>Back</button>
        <button onClick={() => navigate(`/inventory/raw-materials/${itemCode}/new-purchase`)}>
          + New Purchase
        </button>
      </div>

      {/* 3. Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Qty</th>
              <th>Total (Rp)</th>
              <th>Vendor</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr><td colSpan="5" style={{textAlign:'center'}}>No purchases found.</td></tr>
            ) : (
              purchases.map((p) => (
                <tr key={p._id}>
                  <td>{p.purchaseCode}</td>
                  <td>{new Date(p.date).toLocaleDateString()}</td>
                  <td>{p.qty}</td>
                  <td>{formatRupiah(p.priceTotal)}</td>
                  <td>{p.vendor}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Window>
  );
}

export default MaterialPurchasePage;