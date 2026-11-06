import React, { useState } from 'react';
import { usePos } from '../context/PosContext';

export const BanksView: React.FC = () => {
  const { banks } = usePos();
  const [bankList, setBankList] = useState(banks);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bankName, setBankName] = useState('');
  const [searchString, setSearchString] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim()) return;

    setBankList([
      ...bankList,
      {
        id: bankList.length + 1,
        bankName: bankName.trim(),
        accountTitle: bankName.trim(),
        accountNumber: 'PKR-00' + (bankList.length + 1),
        balance: 0,
      },
    ]);

    setBankName('');
    setShowAddForm(false);
  };

  const filtered = bankList.filter((b) =>
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
          style={{ backgroundColor: '#866ec7', borderColor: '#866ec7', color: '#fff' }}
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

      {/* Bank Table matching demo.regalpos.pk/Admin/Viewbank */}
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
                      onClick={() => alert(`Edit bank: ${b.bankName}`)}
                      className="btn btn-link text-info p-0 text-xs font-semibold"
                      style={{ color: '#17a2b8', textDecoration: 'none' }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete bank ${b.bankName}?`)) {
                          setBankList(bankList.filter((x) => x.id !== b.id));
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
