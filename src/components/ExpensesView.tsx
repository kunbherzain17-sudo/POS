import React, { useState } from 'react';
import { usePos } from '../context/PosContext';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense } = usePos();
  const [showAddForm, setShowAddForm] = useState(false);
  const [particular, setParticular] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseType, setExpenseType] = useState('foods');
  const [bank, setBank] = useState('Cash');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!particular.trim() || !amount) return;

    addExpense({
      type: expenseType,
      expense: particular.trim(),
      amount: parseFloat(amount) || 0,
      date: new Date().toLocaleDateString('en-GB'),
    });

    setParticular('');
    setAmount('');
    setShowAddForm(false);
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '15px 20px', borderRadius: '4px' }}>
      <h4 style={{ textAlign: 'center', paddingTop: '0px !important', paddingBottom: '0px !important', fontWeight: 'bold' }}>
        View Expense
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
          onClick={() => alert('Expense Types: foods, Electric, aSHFAQ sALARY, RENT, chai, Entertainment')}
          className="btn btn-primary"
          id="paye"
          style={{ backgroundColor: '#866ec7', borderColor: '#866ec7', color: '#fff' }}
        >
          Expense Type
        </button>
      </div>

      {showAddForm && (
        <div id="customerForm" className="p-4 bg-slate-50 border border-slate-300 rounded mb-4">
          <form onSubmit={handleFormSubmit}>
            <div className="row grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <div className="form-group">
                <label className="text-xs font-bold text-slate-700 block mb-1">Expense Particular:</label>
                <input
                  className="form-control-regal"
                  required
                  type="text"
                  value={particular}
                  onChange={(e) => setParticular(e.target.value)}
                  placeholder="e.g. chai"
                />
              </div>

              <div className="form-group">
                <label className="text-xs font-bold text-slate-700 block mb-1">Amount:</label>
                <input
                  className="form-control-regal"
                  required
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="250.00"
                />
              </div>

              <div className="form-group">
                <label className="text-xs font-bold text-slate-700 block mb-1">Type:</label>
                <select
                  className="form-control-regal"
                  value={expenseType}
                  onChange={(e) => setExpenseType(e.target.value)}
                >
                  <option value="foods">foods</option>
                  <option value="Electric">Electric</option>
                  <option value="aSHFAQ sALARY">aSHFAQ sALARY</option>
                  <option value="RENT">RENT</option>
                  <option value="FUEL FOR TUKTUK">FUEL FOR TUKTUK</option>
                  <option value="chai">chai</option>
                  <option value="anas">anas</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
              </div>

              <div className="form-group">
                <label className="text-xs font-bold text-slate-700 block mb-1">Bank:</label>
                <select
                  className="form-control-regal"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="easypaisa">easypaisa</option>
                  <option value="Ubl">Ubl</option>
                  <option value="cash petty">cash petty</option>
                  <option value="Feg">Feg</option>
                  <option value="soneri">soneri</option>
                </select>
              </div>
            </div>

            <div className="form-group flex gap-2">
              <button type="submit" className="btn btn-success" id="insertcustomer">Save</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Expense Table matching demo.regalpos.pk/Admin/Viewexpense */}
      <div className="table-responsive overflow-x-auto">
        <table className="table table-striped regal-table w-full text-xs">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>ID</th>
              <th>Name</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'center' }}>Date</th>
              <th>Type</th>
              <th style={{ textAlign: 'center', width: '90px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td style={{ fontWeight: 'bold' }}>{e.id}</td>
                <td style={{ fontWeight: 600 }}>{e.expense}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#dc3545' }}>
                  {e.amount.toFixed(2)}
                </td>
                <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{e.date}</td>
                <td>{e.type}</td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => alert('Voucher verified.')}
                    className="btn btn-link text-info p-0 text-xs font-semibold"
                    style={{ color: '#17a2b8', textDecoration: 'none' }}
                  >
                    View
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
