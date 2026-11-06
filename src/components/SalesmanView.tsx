import React, { useState } from 'react';
import { usePos } from '../context/PosContext';

export const SalesmanView: React.FC = () => {
  const { salesmen } = usePos();
  const [salesmanList, setSalesmanList] = useState([
    { id: 1, name: 'Rehman', phone: '03123456780', address: 'Karachi, PK' },
    { id: 2, name: 'Jawad khan', phone: '03223344551', address: 'Karachi, PK' },
    { id: 3, name: 'Anas', phone: '03456677889', address: 'Karachi, PK' },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchString, setSearchString] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSalesmanList([
      ...salesmanList,
      {
        id: salesmanList.length + 1,
        name: name.trim(),
        phone: phone.trim() || '0',
        address: address.trim() || '0',
      },
    ]);

    setName('');
    setPhone('');
    setAddress('');
    setShowAddForm(false);
  };

  const filtered = salesmanList.filter((s) => {
    if (!searchString.trim()) return true;
    const q = searchString.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.phone.includes(q);
  });

  return (
    <div style={{ backgroundColor: '#fff', padding: '15px 20px', borderRadius: '4px' }}>
      <h4 style={{ textAlign: 'center', paddingTop: '0px !important', paddingBottom: '0px !important', fontWeight: 'bold' }}>
        View Salesman
      </h4>

      <div className="button-container my-3 flex gap-2">
        <button
          type="button"
          id="addNewBtn"
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
          style={{ backgroundColor: '#866ec7', borderColor: '#866ec7', color: '#fff' }}
        >
          Add New
        </button>
        <button
          type="button"
          id="toggleSearch"
          onClick={() => setShowSearch(!showSearch)}
          className="btn btn-primary"
          style={{ backgroundColor: '#866ec7', borderColor: '#866ec7', color: '#fff' }}
        >
          <i className="fa fa-search mr-1" /> Search
        </button>
      </div>

      {showSearch && (
        <form onSubmit={(e) => e.preventDefault()} className="mb-3 p-3 bg-slate-50 border rounded">
          <div className="row flex items-end gap-3">
            <div className="col-md-3">
              <label className="text-xs font-bold text-slate-700 block mb-1">Search:</label>
              <input
                className="form-control-regal"
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
                placeholder="Type salesman name..."
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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

      {/* Salesman Table matching demo.regalpos.pk/Admin/Viewsalesman */}
      <div className="table-responsive overflow-x-auto">
        <table className="table table-striped regal-table w-full text-xs">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th style={{ textAlign: 'center', width: '130px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td style={{ fontFamily: 'monospace' }}>{s.phone}</td>
                <td>{s.address}</td>
                <td style={{ textAlign: 'center' }}>
                  <div className="btn-group flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => alert(`Edit ${s.name}`)}
                      className="btn btn-link text-info p-0 text-xs font-semibold"
                      style={{ color: '#17a2b8', textDecoration: 'none' }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete ${s.name}?`)) {
                          setSalesmanList(salesmanList.filter((x) => x.id !== s.id));
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
    </div>
  );
};
