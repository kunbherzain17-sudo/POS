import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { usePos } from '../context/PosContext';
import { Product } from '../types';

export const ProductsView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, categories, addCategory } = usePos();
  const [showSearch, setShowSearch] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form fields
  const [proName, setProName] = useState('');
  const [proPrice, setProPrice] = useState('');
  const [proCost, setProCost] = useState('');
  const [proDis, setProDis] = useState('0');
  const [proBarcode, setProBarcode] = useState('');
  const [limitQuan, setLimitQuan] = useState('5');
  const [categoryVal, setCategoryVal] = useState(categories[0] || 'Accessories');

  // Quick category modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');

  const handleAddNew = () => {
    setEditingId(null);
    setProName('');
    setProPrice('');
    setProCost('');
    setProDis('0');
    setProBarcode(Math.floor(1000000 + Math.random() * 9000000).toString());
    setLimitQuan('5');
    setCategoryVal(categories[0] || 'Accessories');
    setShowAddForm(true);
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setProName(p.name);
    setProPrice(p.price.toString());
    setProCost(p.cost.toString());
    setProDis(p.discount.toString());
    setProBarcode(p.barcode);
    setLimitQuan(p.quantityLimit.toString());
    setCategoryVal(p.category);
    setShowAddForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proName || !proPrice || !proCost) return;

    if (editingId) {
      const existing = products.find((p) => p.id === editingId);
      if (existing) {
        updateProduct({
          ...existing,
          name: proName,
          price: parseFloat(proPrice) || 0,
          cost: parseFloat(proCost) || 0,
          discount: parseFloat(proDis) || 0,
          barcode: proBarcode,
          quantityLimit: parseInt(limitQuan) || 5,
          category: categoryVal,
        });
      }
    } else {
      addProduct({
        name: proName,
        price: parseFloat(proPrice) || 0,
        cost: parseFloat(proCost) || 0,
        discount: parseFloat(proDis) || 0,
        barcode: proBarcode,
        quantityLimit: parseInt(limitQuan) || 5,
        category: categoryVal,
        stock: 25,
      });
    }

    setShowAddForm(false);
  };

  const handleExportToExcel = () => {
    const csv = 'ID,Name,Price,Cost,Discount,Barcode,Category,Quantity Limit,Stock\n' +
      products.map(p => `${p.id},"${p.name}",${p.price},${p.cost},${p.discount},${p.barcode},"${p.category}",${p.quantityLimit},${p.stock}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'RegalPOS_Product_Report.csv';
    a.click();
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatInput.trim()) {
      addCategory(newCatInput.trim());
      setCategoryVal(newCatInput.trim());
      setNewCatInput('');
      setShowCatModal(false);
    }
  };

  const filtered = products.filter((p) => {
    if (!searchString.trim()) return true;
    const q = searchString.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ backgroundColor: '#fff', padding: '15px 20px', borderRadius: '4px' }}>
      <h4 style={{ textAlign: 'center', paddingTop: '0px !important', paddingBottom: '0px !important', fontWeight: 'bold' }}>
        View Product
      </h4>

      {/* Button Container matching demo.regalpos.pk */}
      <div className="button-container my-3 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          id="addNewBtn"
          onClick={handleAddNew}
          className="btn btn-primary"
          style={{ backgroundColor: '#866ec7', borderColor: '#866ec7', color: '#fff' }}
        >
          Add New
        </button>
        <button
          type="button"
          id="toggleSearch"
          onClick={() => setShowSearch(!showSearch)}
          className="btn"
          style={{ backgroundColor: 'mediumpurple', color: '#fff' }}
        >
          <Search className="mr-1 h-4 w-4" aria-hidden="true" /> Search
        </button>
        <button
          type="button"
          onClick={() => setShowCatModal(true)}
          className="btn btn-primary"
          id="cat"
          style={{ backgroundColor: '#866ec7', borderColor: '#866ec7', color: '#fff' }}
        >
          Category
        </button>
        <button
          type="button"
          onClick={handleExportToExcel}
          className="btn btn-primary"
          id="exportbutton"
          style={{ backgroundColor: '#866ec7', borderColor: '#866ec7', color: '#fff' }}
        >
          Export to Excel
        </button>
        <button
          type="button"
          id="importButton"
          onClick={() => alert('Excel Import template: Please upload .xlsx format product catalog.')}
          className="btn btn-primary"
          style={{ backgroundColor: '#866ec7', borderColor: '#866ec7', color: '#fff' }}
        >
          Import Excel
        </button>
      </div>

      {/* Search Form */}
      {showSearch && (
        <form id="searchForm" onSubmit={(e) => e.preventDefault()} className="mb-3 p-3 bg-slate-50 border rounded">
          <div className="row flex items-end gap-3">
            <div className="col-md-3 col-sm-6">
              <div className="form-group">
                <label className="text-xs font-bold text-slate-700 block mb-1">Search</label>
                <input
                  className="form-control-regal"
                  id="searchString"
                  value={searchString}
                  onChange={(e) => setSearchString(e.target.value)}
                  placeholder="Type product name or barcode..."
                  type="text"
                />
              </div>
            </div>
            <div className="col-md-2 col-sm-6">
              <button
                type="button"
                className="btn btn-secondary"
                id="cancelsearch"
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

      {/* Add / Edit Form matching #customerForm from Viewproduct.html */}
      {showAddForm && (
        <div id="customerForm" className="p-4 bg-slate-50 border border-slate-300 rounded mb-4">
          <form onSubmit={handleFormSubmit}>
            <div className="row grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div className="form-group">
                <label className="text-xs font-bold text-slate-700 block mb-1">Name:</label>
                <input
                  className="form-control-regal"
                  id="pro_name"
                  required
                  type="text"
                  value={proName}
                  onChange={(e) => setProName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="text-xs font-bold text-slate-700 block mb-1">Price:</label>
                <input
                  className="form-control-regal"
                  id="pro_price"
                  required
                  type="number"
                  step="any"
                  value={proPrice}
                  onChange={(e) => setProPrice(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="text-xs font-bold text-slate-700 block mb-1">Cost:</label>
                <input
                  className="form-control-regal"
                  id="pro_cost"
                  required
                  type="number"
                  step="any"
                  value={proCost}
                  onChange={(e) => setProCost(e.target.value)}
                />
              </div>
            </div>

            <div className="row grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <div className="form-group">
                <label className="text-xs font-bold text-slate-700 block mb-1">Discount:</label>
                <input
                  className="form-control-regal"
                  id="pro_dis"
                  required
                  type="text"
                  value={proDis}
                  onChange={(e) => setProDis(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="text-xs font-bold text-slate-700 block mb-1">Barcode:</label>
                <input
                  className="form-control-regal"
                  id="pro_barcode"
                  required
                  type="text"
                  value={proBarcode}
                  onChange={(e) => setProBarcode(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="text-xs font-bold text-slate-700 block mb-1">Quantity Limit:</label>
                <input
                  className="form-control-regal"
                  id="limitquan"
                  required
                  type="text"
                  value={limitQuan}
                  onChange={(e) => setLimitQuan(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="text-xs font-bold text-slate-700 block mb-1">Category:</label>
                <div className="flex gap-1">
                  <select
                    className="form-control-regal"
                    id="cat_id_fk"
                    value={categoryVal}
                    onChange={(e) => setCategoryVal(e.target.value)}
                    required
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCatModal(true)}
                    className="btn btn-success btn-sm px-2.5 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group flex gap-2">
              <button type="submit" className="btn btn-success">Save</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Product Table matching #productTable */}
      <div className="table-responsive overflow-x-auto">
        <table className="table table-striped regal-table w-full text-xs" id="productTable">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>ID</th>
              <th>Name</th>
              <th style={{ textAlign: 'right' }}>Price</th>
              <th style={{ textAlign: 'right' }}>Cost</th>
              <th style={{ textAlign: 'right' }}>Discount</th>
              <th style={{ textAlign: 'center' }}>Barcode</th>
              <th>Category</th>
              <th style={{ textAlign: 'center' }}>Quantity Limit</th>
              <th style={{ textAlign: 'center', width: '130px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 'bold' }}>{p.id}</td>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{p.price.toFixed(2)}</td>
                <td style={{ textAlign: 'right' }}>{p.cost.toFixed(2)}</td>
                <td style={{ textAlign: 'right', color: p.discount > 0 ? 'red' : 'inherit' }}>
                  {p.discount.toFixed(2)}
                </td>
                <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{p.barcode}</td>
                <td>{p.category}</td>
                <td style={{ textAlign: 'center' }}>{p.quantityLimit}</td>
                <td style={{ textAlign: 'center' }}>
                  <div className="btn-group flex justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(p)}
                      className="btn btn-link text-info p-0 text-xs font-semibold mr-2"
                      style={{ color: '#17a2b8', textDecoration: 'none' }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                          deleteProduct(p.id);
                        }
                      }}
                      className="btn btn-link text-danger p-0 text-xs font-semibold"
                      style={{ color: '#dc3545', textDecoration: 'none' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-5 max-w-sm w-full shadow-2xl animate-scaleIn text-xs">
            <h5 className="font-bold text-base mb-3" style={{ color: '#866ec7' }}>
              Add Category
            </h5>
            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  placeholder="Enter Category Name"
                  className="form-control-regal"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCatModal(false)} className="btn btn-secondary">
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
