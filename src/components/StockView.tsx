import React, { useState } from 'react';
import { Barcode, ChevronDown, Search, X } from 'lucide-react';
import { usePos } from '../context/PosContext';
import { Product } from '../types';
import { BarcodePrintModal } from './BarcodePrintModal';

export const StockView: React.FC = () => {
  const { products, updateProduct } = usePos();
  const [showSearch, setShowSearch] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [reportFilter, setReportFilter] = useState<'all' | 'low' | 'out'>('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustQtyInput, setAdjustQtyInput] = useState('');

  // Add stock incoming form
  const [showAddStockForm, setShowAddStockForm] = useState(false);
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || 1);
  const [incomingQty, setIncomingQty] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(() => new Set());
  const [showBarcodePrint, setShowBarcodePrint] = useState(false);

  const selectedProducts = products.filter((product) => selectedProductIds.has(product.id));

  const toggleProductSelection = (productId: number) => {
    setSelectedProductIds((previous) => {
      const next = new Set(previous);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const toggleFilteredSelection = () => {
    const allFilteredSelected = filtered.length > 0 && filtered.every((product) => selectedProductIds.has(product.id));
    setSelectedProductIds((previous) => {
      const next = new Set(previous);
      filtered.forEach((product) => {
        if (allFilteredSelected) next.delete(product.id);
        else next.add(product.id);
      });
      return next;
    });
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    const qty = parseInt(adjustQtyInput);
    if (isNaN(qty)) return;

    updateProduct({
      ...adjustingProduct,
      stock: qty,
    });
    setAdjustingProduct(null);
  };

  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(incomingQty);
    if (isNaN(qty) || qty <= 0) return;

    const p = products.find((x) => x.id === selectedProdId);
    if (p) {
      updateProduct({
        ...p,
        stock: p.stock + qty,
      });
      alert(`Added ${qty} units to "${p.name}". New Stock: ${p.stock + qty}`);
      setShowAddStockForm(false);
      setIncomingQty('');
    }
  };

  const filtered = products.filter((p) => {
    if (reportFilter === 'low' && (p.stock <= 0 || p.stock > p.quantityLimit)) return false;
    if (reportFilter === 'out' && p.stock > 0) return false;
    if (searchString.trim()) {
      const q = searchString.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="inventory-view-panel" style={{ backgroundColor: '#fff', padding: '15px 20px', borderRadius: '4px' }}>
      <h2 style={{ textAlign: 'center', fontWeight: 'bold', paddingTop: '0px !important', paddingBottom: '0px !important', fontSize: '1.6rem' }}>
        Stock View
      </h2>

      {/* Inventory actions */}
      <div className="button-container inventory-actions my-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowAddStockForm(true)}
          className="btn btn-primary action-btn"
          id="addstock"
          style={{ backgroundColor: 'mediumpurple', color: '#fff', borderColor: 'mediumpurple' }}
        >
          Add Stock
        </button>

        <button
          type="button"
          className="search-toggle-btn"
          id="toggleSearch"
          onClick={() => setShowSearch(!showSearch)}
          aria-expanded={showSearch}
          aria-controls="stock-search-form"
          title={showSearch ? 'Close inventory search' : 'Search inventory'}
        >
          {showSearch ? <X size={16} aria-hidden="true" /> : <Search size={16} aria-hidden="true" />}
          <span>Search</span>
        </button>

        <button
          type="button"
          onClick={() => setShowBarcodePrint(true)}
          disabled={selectedProducts.length === 0}
          className="btn btn-primary action-btn"
          style={{ backgroundColor: 'mediumpurple', color: '#fff', borderColor: 'mediumpurple' }}
        >
          <Barcode className="mr-1 inline h-4 w-4" aria-hidden="true" />
          Print labels ({selectedProducts.length})
        </button>
        <button
          type="button"
          onClick={toggleFilteredSelection}
          disabled={filtered.length === 0}
          className="btn btn-secondary action-btn"
        >
          {filtered.length > 0 && filtered.every((product) => selectedProductIds.has(product.id))
            ? 'Clear visible selection'
            : `Select visible (${filtered.length})`}
        </button>

        <button
          type="button"
          onClick={() => setReportFilter('all')}
          className="btn btn-primary action-btn"
          style={{ backgroundColor: 'mediumpurple', color: '#fff', borderColor: 'mediumpurple' }}
        >
          All Stock
        </button>

        {/* Reports dropdown matching original layout */}
        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="btn btn-primary action-btn flex items-center gap-1"
            style={{ backgroundColor: 'mediumpurple', color: '#fff', borderColor: 'mediumpurple' }}
          >
            <span>Reports</span> <ChevronDown className="ml-1 h-4 w-4" aria-hidden="true" />
          </button>

          {showDropdown && (
            <div
              className="dropdown-menu custom-dropdown absolute left-0 mt-1 bg-white border border-slate-200 rounded shadow-lg z-50 py-1 text-xs"
              style={{ minWidth: '160px' }}
            >
              <button
                type="button"
                onClick={() => { setReportFilter('all'); setShowDropdown(false); }}
                className="dropdown-item w-full text-left px-3 py-1.5 hover:bg-slate-100 block"
              >
                Stock Report
              </button>
              <button
                type="button"
                onClick={() => { setReportFilter('low'); setShowDropdown(false); }}
                className="dropdown-item w-full text-left px-3 py-1.5 hover:bg-slate-100 block text-amber-700"
              >
                Short Stock
              </button>
              <button
                type="button"
                onClick={() => { setReportFilter('out'); setShowDropdown(false); }}
                className="dropdown-item w-full text-left px-3 py-1.5 hover:bg-slate-100 block text-rose-700"
              >
                Out Of Stock
              </button>
            </div>
          )}
        </div>
      </div>

      {showSearch && (
        <form id="stock-search-form" onSubmit={(e) => e.preventDefault()} className="mb-3 p-3 bg-slate-50 border rounded">
          <div className="row flex items-end gap-3">
            <div className="col-md-3">
              <label className="text-xs font-bold text-slate-700 block mb-1">Search Product / SKU</label>
              <input
                className="form-control-regal"
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
                placeholder="Type to filter inventory..."
                type="text"
              />
            </div>
            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSearchString('');
                  setShowSearch(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {showAddStockForm && (
        <div className="p-4 bg-slate-50 border border-slate-300 rounded mb-4">
          <h5 className="font-bold text-sm text-slate-800 mb-3">Add Incoming Stock Shipment</h5>
          <form onSubmit={handleAddStockSubmit} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-slate-700 block mb-1">Select Product:</label>
              <select
                value={selectedProdId}
                onChange={(e) => setSelectedProdId(Number(e.target.value))}
                className="form-control-regal"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current: {p.stock})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-40">
              <label className="text-xs font-bold text-slate-700 block mb-1">Units Received:</label>
              <input
                type="number"
                min="1"
                required
                value={incomingQty}
                onChange={(e) => setIncomingQty(e.target.value)}
                className="form-control-regal font-bold"
                placeholder="Qty"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn btn-success">Add Stock</button>
              <button type="button" onClick={() => setShowAddStockForm(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory list */}
      <div className="table-responsive inventory-table-desktop overflow-x-auto">
        <table className="table table-striped regal-table w-full text-xs">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>ID</th>
              <th style={{ width: '42px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && filtered.every((product) => selectedProductIds.has(product.id))}
                  onChange={toggleFilteredSelection}
                  aria-label="Select all visible products"
                />
              </th>
              <th>Product Name</th>
              <th>Barcode</th>
              <th>Category</th>
              <th style={{ textAlign: 'right' }}>Cost</th>
              <th style={{ textAlign: 'right' }}>Retail</th>
              <th style={{ textAlign: 'center' }}>In Stock</th>
              <th style={{ textAlign: 'right' }}>Total Purchase</th>
              <th style={{ textAlign: 'right' }}>Total Retail</th>
              <th style={{ textAlign: 'center' }}>Limit</th>
              <th style={{ textAlign: 'center', width: '120px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const isOut = p.stock <= 0;
              const isLow = p.stock > 0 && p.stock <= p.quantityLimit;

              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 'bold' }}>{p.id}</td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedProductIds.has(p.id)}
                      onChange={() => toggleProductSelection(p.id)}
                      aria-label={`Select ${p.name} for barcode printing`}
                    />
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ fontFamily: 'monospace' }}>{p.barcode}</td>
                  <td>{p.category}</td>
                  <td style={{ textAlign: 'right' }}>{p.cost.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{p.price.toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        fontWeight: 'bold',
                        color: isOut ? '#dc3545' : isLow ? '#d39e00' : '#28a745',
                        fontSize: '14px',
                      }}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>{(p.cost * p.stock).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{(p.price * p.stock).toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>{p.quantityLimit}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setAdjustingProduct(p);
                        setAdjustQtyInput(p.stock.toString());
                      }}
                      className="btn btn-primary btn-sm px-2 py-0 text-xs font-semibold"
                      style={{ backgroundColor: 'mediumpurple', borderColor: 'mediumpurple' }}
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="responsive-record-grid inventory-card-grid">
        {filtered.map((p) => {
          const isOut = p.stock <= 0;
          const isLow = p.stock > 0 && p.stock <= p.quantityLimit;

          return (
            <article className="responsive-record-card" key={p.id}>
              <header className="responsive-record-heading inventory-record-heading">
                <input
                  type="checkbox"
                  checked={selectedProductIds.has(p.id)}
                  onChange={() => toggleProductSelection(p.id)}
                  aria-label={`Select ${p.name} for barcode printing`}
                />
                <div className="responsive-record-title">
                  <h3>{p.name}</h3>
                  <span>{p.category} · #{p.id}</span>
                </div>
              </header>
              <dl className="responsive-record-details">
                <div><dt>Retail</dt><dd>Rs. {p.price.toFixed(2)}</dd></div>
                <div><dt>Cost</dt><dd>Rs. {p.cost.toFixed(2)}</dd></div>
                <div>
                  <dt>In stock</dt>
                  <dd className={isOut ? 'stock-value-out' : isLow ? 'stock-value-low' : 'stock-value-ok'}>{p.stock}</dd>
                </div>
                <div><dt>Limit</dt><dd>{p.quantityLimit}</dd></div>
                <div><dt>Total cost</dt><dd>Rs. {(p.cost * p.stock).toFixed(2)}</dd></div>
                <div><dt>Stock value</dt><dd>Rs. {(p.price * p.stock).toFixed(2)}</dd></div>
                <div className="responsive-record-wide"><dt>Barcode</dt><dd>{p.barcode}</dd></div>
              </dl>
              <footer className="responsive-record-actions">
                <button
                  type="button"
                  onClick={() => {
                    setAdjustingProduct(p);
                    setAdjustQtyInput(p.stock.toString());
                  }}
                  className="btn btn-primary btn-sm px-2 py-0 text-xs font-semibold"
                  style={{ backgroundColor: 'mediumpurple', borderColor: 'mediumpurple' }}
                >
                  Adjust stock
                </button>
              </footer>
            </article>
          );
        })}
      </div>

      {adjustingProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-5 max-w-sm w-full shadow-2xl animate-scaleIn text-xs">
            <h5 className="font-bold text-base mb-2" style={{ color: '#6750a4' }}>
              Adjust Inventory Stock
            </h5>
            <p className="text-slate-600 mb-3">
              Product: <strong>{adjustingProduct.name}</strong>
            </p>
            <form onSubmit={handleAdjustSubmit} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">New Stock Count</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustQtyInput}
                  onChange={(e) => setAdjustQtyInput(e.target.value)}
                  className="form-control-regal font-bold text-base"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAdjustingProduct(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showBarcodePrint && selectedProducts.length > 0 && (
        <BarcodePrintModal
          products={selectedProducts}
          onClose={() => setShowBarcodePrint(false)}
        />
      )}
    </div>
  );
};
