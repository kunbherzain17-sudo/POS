import React, { useState } from 'react';
import { usePos } from '../context/PosContext';

export const PurchaseReturnView: React.FC = () => {
  const { vendors, products, updateProduct } = usePos();
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || 1);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || 1);
  const [returnQty, setReturnQty] = useState('1');
  const [returnCost, setReturnCost] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const currentVendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(returnQty) || 0;
    const cost = parseFloat(returnCost) || currentProduct?.cost || 0;

    if (qty <= 0) {
      alert('Please enter a valid quantity to return.');
      return;
    }

    if (currentProduct && qty > currentProduct.stock) {
      alert(`Cannot return ${qty} units. Current in-stock is only ${currentProduct.stock}.`);
      return;
    }

    // Deduct stock
    if (currentProduct) {
      updateProduct({
        ...currentProduct,
        stock: currentProduct.stock - qty,
      });
    }

    setStatusMessage(
      `Successfully returned ${qty} units of "${currentProduct?.name}" to vendor "${currentVendor?.name}". Total Credit: Rs. ${(qty * cost).toFixed(2)}`
    );
    setReturnQty('1');
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '15px 20px', borderRadius: '4px' }}>
      <h4 style={{ textAlign: 'center', paddingTop: '0px !important', paddingBottom: '0px !important', fontWeight: 'bold' }}>
        Purchase Return
      </h4>

      <p className="text-center text-xs text-slate-500 mb-4">
        Debit Note / Return defective or unsold stock to vendor and adjust supplier payable ledger.
      </p>

      {statusMessage && (
        <div className="alert alert-success p-3 rounded mb-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          {statusMessage}
        </div>
      )}

      <div className="max-w-2xl mx-auto p-4 bg-slate-50 border border-slate-300 rounded">
        <form onSubmit={handleReturnSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Select Vendor:</label>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(Number(e.target.value))}
                className="form-control-regal font-bold"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} (Balance: Rs. {v.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Select Product:</label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedProductId(id);
                  const p = products.find((x) => x.id === id);
                  if (p) setReturnCost(p.cost.toString());
                }}
                className="form-control-regal font-bold"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current Stock: {p.stock})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Return Quantity:</label>
              <input
                type="number"
                min="1"
                required
                value={returnQty}
                onChange={(e) => setReturnQty(e.target.value)}
                className="form-control-regal font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Unit Cost Price (Rs.):</label>
              <input
                type="number"
                step="any"
                value={returnCost || currentProduct?.cost || ''}
                onChange={(e) => setReturnCost(e.target.value)}
                placeholder={currentProduct?.cost.toString()}
                className="form-control-regal font-bold"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="btn btn-primary px-4 py-2 font-bold"
              style={{ backgroundColor: '#6750a4', borderColor: '#6750a4', color: '#fff' }}
            >
              Process Purchase Return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
