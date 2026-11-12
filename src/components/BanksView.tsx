import React, { useState } from 'react';
import { usePos } from '../context/PosContext';

export const BanksView: React.FC = () => {
  const { banks, addBank, deleteBank } = usePos();
  const [showAddForm, setShowAddForm] = useState(false);
  const [bankName, setBankName] = useState('');
  const [searchString, setSearchString] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim()) return;

    addBank({
      bankName: bankName.trim(),
      accountTitle: bankName.trim(),
      accountNumber: '',
      balance: 0,
    });

    setBankName('');
    setShowAddForm(false);
  };

  const filtered = banks.filter((b) =>
    b.bankName.toLowerCase().includes(searchString.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#fff', padding: '15px 20px', borderRadius: '4px' }}>
      <h4 style={{ textAlign: 'center', paddingTop: '0px !important', paddingBottom: '0px !important', fontWeight: 'bold' }}>
        View Bank
      </h4>

      <div className="button-container my-3 flex justify-between items-center">
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
          style={{ backgroundColor: '#6750a4', borderColor: '#6750a4', color: '#fff' }}
        >
          Add New
        </button>

        <input
          type="text"
          value={searchString}
          onChange={(e) => setSearchString(e.target.value)}
          placeholder="Search By Name..."
          className="form-control-regal"
          style={{ maxWidth: '250px' }}
        />
      </div>

      {showAddForm && (
        <div className="p-4 bg-slate-50 border border-slate-300 rounded mb-4">
          <form onSubmit={handleAddSubmit} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-700 block mb-1">Bank Name:</label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Enter Bank Name (e.g. Meezan, HBL, Cash Drawer)"
                className="form-control-regal"
              />
            </div>
            <button type="submit" className="btn btn-success">Save</button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">Cancel</button>
          </form>
        </div>
      )}

      <div className="table-responsive overflow-x-auto">
        <table className="table table-striped regal-table w-full text-xs">
          <thead>
            <tr>
              <th>Name</th>
              <th style={{ textAlign: 'right' }}>Balance</th>
              <th style={{ textAlign: 'center', width: '150px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id}>
                <td style={{ fontWeight: 600 }}>{b.bankName}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: b.balance < 0 ? '#dc3545' : '#28a745' }}>
                  {b.balance.toFixed(2)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div className="btn-group flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete bank ${b.bankName}?`)) deleteBank(b.id);
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
