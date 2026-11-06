import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { usePos } from '../context/PosContext';
import { Vendor } from '../types';

export const VendorsView: React.FC = () => {
  const { vendors, addVendor } = usePos();
  const [showSearch, setShowSearch] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [vendorFilter, setVendorFilter] = useState<'All' | 'Credited' | 'NonCredited'>('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [payVendor, setPayVendor] = useState<Vendor | null>(null);
  const [payAmount, setPayAmount] = useState('');

  // Form
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [cnic, setCnic] = useState('0');
  const [balance, setBalance] = useState('0');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addVendor({
      name: name.trim(),
      contact: contact.trim() || '0',
      balance: parseFloat(balance) || 0,
      totalPurchasing: 0,
    });

    setName('');
    setContact('');
    setAddress('');
    setCnic('0');
    setBalance('0');
    setShowAddForm(false);
  };

  const filtered = vendors.filter((v) => {
    if (vendorFilter === 'Credited' && v.balance <= 0) return false;
    if (vendorFilter === 'NonCredited' && v.balance > 0) return false;
    if (searchString.trim()) {
      const q = searchString.toLowerCase();
      return v.name.toLowerCase().includes(q) || v.contact.includes(q);
    }
    return true;
  });

  return (
    <div style={{ backgroundColor: '#fff', padding: '15px 20px', borderRadius: '4px' }}>
      <h4 style={{ textAlign: 'center', paddingTop: '0px !important', paddingBottom: '0px !important', fontWeight: 'bold' }}>
        View Vendor
      </h4>

      {/* Button Container matching demo.regalpos.pk */}
      <div className="button-container my-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          id="addNewBtn"
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary"
          style={{ backgroundColor: '#866ec7', borderColor: '#866ec7', color: '#fff' }}
        >
          Add New
        </button>
        <button
          type="button"
          id="paye"
          onClick={() => {
            const v = vendors.find((x) => x.balance > 0) || vendors[0];
            if (v) {
              setPayVendor(v);
              setPayAmount(v.balance.toString());
            }
          }}
          className="btn btn-primary"
          style={{ backgroundColor: '#866ec7', borderColor: '#866ec7', color: '#fff' }}
        >
          Payment
        </button>
        <button
          type="button"
          id="stockreport"
          onClick={() => alert(`Vendors Directory: Total ${vendors.length} vendors on file.`)}
          className="btn btn-primary"
          style={{ backgroundColor: '#866ec7', borderColor: '#866ec7', color: '#fff' }}
        >
          Vendor Details
        </button>
        <button
          type="button"
          id="toggleSearch"
          onClick={() => setShowSearch(!showSearch)}
          className="btn btn-primary"
          style={{ backgroundColor: '#866ec7', borderColor: '#866ec7', color: '#fff' }}
        >
          <Search className="mr-1 h-4 w-4" aria-hidden="true" /> Search
        </button>
        <select
          id="vendorFilter"
          value={vendorFilter}
          onChange={(e) => setVendorFilter(e.target.value as any)}
          className="btn btn-primary"
          style={{
            backgroundColor: 'mediumpurple',
            color: 'white',
            borderColor: 'mediumpurple',
            height: '34px',
            padding: '4px 10px',
          }}
        >
          <option value="All" style={{ color: '#000' }}>All</option>
          <option value="Credited" style={{ color: '#000' }}>Credit</option>
          <option value="NonCredited" style={{ color: '#000' }}>Non-Credit</option>
        </select>
      </div>

      {showSearch && (
        <form onSubmit={(e) => e.preventDefault()} className="mb-3 p-3 bg-slate-50 border rounded">
          <div className="row flex items-end gap-3">
            <div className="col-md-3">
              <label className="text-xs font-bold text-slate-700 block mb-1">Search Vendor</label>
              <input
                className="form-control-regal"
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
                placeholder="Search by vendor name..."
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

      {showAddForm && (
        <div id="customerForm" className="p-4 bg-slate-50 border border-slate-300 rounded mb-4">
          <form onSubmit={handleFormSubmit}>
            <div className="row grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div className="form-group">
                <label className="text-xs font-bold text-slate-700 block mb-1">Name:</label>
                <input
                  className="form-control-regal"
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone:</label>
                <input
                  className="form-control-regal"
                  required
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="text-xs font-bold text-slate-700 block mb-1">Address:</label>
                <input
                  className="form-control-regal"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group flex gap-2">
              <button type="submit" className="btn btn-success">Save</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Vendor Table */}
      <div className="table-responsive overflow-x-auto">
        <table className="table table-striped regal-table w-full text-xs">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th style={{ textAlign: 'right' }}>Total Purchasing</th>
              <th style={{ textAlign: 'right' }}>Payable Balance</th>
              <th style={{ textAlign: 'center', width: '130px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id}>
                <td style={{ fontWeight: 'bold' }}>{v.id}</td>
                <td style={{ fontWeight: 600 }}>{v.name}</td>
                <td style={{ fontFamily: 'monospace' }}>{v.contact}</td>
                <td>Karachi, Pakistan</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  {v.totalPurchasing.toFixed(2)}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: v.balance > 0 ? 'red' : 'inherit' }}>
                  {v.balance.toFixed(2)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => alert(`Supplier Ledger statement generated for ${v.name}.`)}
                    className="btn btn-link text-info p-0 text-xs font-semibold"
                    style={{ color: '#17a2b8', textDecoration: 'none' }}
                  >
                    Ledger
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
