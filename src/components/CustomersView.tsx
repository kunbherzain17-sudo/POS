import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { usePos } from '../context/PosContext';
import { Customer } from '../types';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, adjustCustomerBalance } = usePos();
  const [showSearch, setShowSearch] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [customerFilter, setCustomerFilter] = useState<'all' | 'balance' | 'nobalance'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [payCustomer, setPayCustomer] = useState<Customer | null>(null);
  const [payAmount, setPayAmount] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [cnic, setCnic] = useState('0');

  const totalMarketBalance = customers.reduce((sum, c) => sum + c.balance, 0);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCustomer({
      name: name.trim(),
      phone: phone.trim() || '0',
      address: address.trim() || '0',
      balance: 0,
      totalPurchasing: 0,
    });

    setName('');
    setPhone('');
    setAddress('');
    setCnic('0');
    setShowAddForm(false);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payCustomer) return;
    const amount = parseFloat(payAmount) || 0;
    if (amount <= 0) return;

    adjustCustomerBalance(payCustomer.id, amount);
    alert(`Payment of Rs. ${amount.toFixed(2)} received from ${payCustomer.name}!`);
    setPayCustomer(null);
    setPayAmount('');
  };

  const filtered = customers.filter((c) => {
    if (customerFilter === 'balance' && c.balance <= 0) return false;
    if (customerFilter === 'nobalance' && c.balance > 0) return false;
    if (searchString.trim()) {
      const q = searchString.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q);
    }
    return true;
  });

  return (
    <div style={{ backgroundColor: '#fff', padding: '15px 20px', borderRadius: '4px' }}>
      <h4 style={{ textAlign: 'center', paddingTop: '0px !important', paddingBottom: '0px !important', fontWeight: 'bold' }}>
        View Customer
      </h4>

      {/* Customer actions */}
      <div className="button-container my-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          id="addNewBtn"
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary"
          style={{ backgroundColor: '#6750a4', borderColor: '#6750a4', color: '#fff' }}
        >
          Add New
        </button>
        <button
          type="button"
          id="paye"
          onClick={() => {
            const debtor = customers.find((c) => c.balance > 0);
            if (debtor) {
              setPayCustomer(debtor);
              setPayAmount(debtor.balance.toString());
            } else {
              alert('All customers have zero balance.');
            }
          }}
          className="btn btn-primary"
          style={{ backgroundColor: '#6750a4', borderColor: '#6750a4', color: '#fff' }}
        >
          Payment
        </button>
        <button
          type="button"
          id="stockreport"
          onClick={() => alert(`Customer Directory: Total ${customers.length} registered customers.`)}
          className="btn btn-primary"
          style={{ backgroundColor: '#6750a4', borderColor: '#6750a4', color: '#fff' }}
        >
          Customers Detail
        </button>
        <button
          type="button"
          id="toggleSearch"
          onClick={() => setShowSearch(!showSearch)}
          className="search-toggle-btn"
          aria-expanded={showSearch}
          aria-controls="customer-search-form"
          title={showSearch ? 'Close customer search' : 'Search customers'}
        >
          {showSearch ? <X size={16} aria-hidden="true" /> : <Search size={16} aria-hidden="true" />}
          <span>Search</span>
        </button>
        <select
          id="customerFilter"
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value as any)}
          className="btn btn-primary"
          style={{
            backgroundColor: 'mediumpurple',
            color: 'white',
            borderColor: 'mediumpurple',
            height: '34px',
            padding: '4px 10px',
          }}
        >
          <option value="all" style={{ color: '#000' }}>All</option>
          <option value="balance" style={{ color: '#000' }}>With Balance</option>
          <option value="nobalance" style={{ color: '#000' }}>Zero Balance</option>
        </select>

        {/* Market Balance Container matching original HTML */}
        <div className="market-balance-container ml-auto flex items-center">
          <span className="balance-title font-bold text-sm text-slate-900 mr-2">Market Balance:</span>
          <span className="balance-amount font-bold text-base text-rose-600">
            Rs. {totalMarketBalance.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Search Form */}
      {showSearch && (
        <form id="customer-search-form" onSubmit={(e) => e.preventDefault()} className="mb-3 p-3 bg-slate-50 border rounded">
          <div className="row flex items-end gap-3">
            <div className="col-md-3">
              <label className="text-xs font-bold text-slate-700 block mb-1">Search Customer</label>
              <input
                className="form-control-regal"
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
                placeholder="Search by name or phone..."
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

      {/* Add Customer Form */}
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
                  required
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

      {/* Customer list */}
      <div className="table-responsive overflow-x-auto">
        <table className="table table-striped regal-table w-full text-xs">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th style={{ textAlign: 'right' }}>Total Purchasing</th>
              <th style={{ textAlign: 'right' }}>Balance</th>
              <th style={{ textAlign: 'center', width: '150px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 'bold' }}>{c.id}</td>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td style={{ fontFamily: 'monospace' }}>{c.phone}</td>
                <td>{c.address || '-'}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  {c.totalPurchasing.toFixed(2)}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: c.balance > 0 ? 'red' : 'inherit' }}>
                  {c.balance.toFixed(2)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div className="btn-group flex justify-center gap-1">
                    {c.balance > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setPayCustomer(c);
                          setPayAmount(c.balance.toString());
                        }}
                        className="btn btn-link text-success p-0 text-xs font-semibold mr-2"
                        style={{ color: '#28a745', textDecoration: 'none' }}
                      >
                        Pay
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => alert(`Ledger report for ${c.name}: Balance Rs. ${c.balance.toFixed(2)}`)}
                      className="btn btn-link text-info p-0 text-xs font-semibold"
                      style={{ color: '#17a2b8', textDecoration: 'none' }}
                    >
                      Ledger
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {payCustomer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-5 max-w-sm w-full shadow-2xl animate-scaleIn text-xs">
            <h5 className="font-bold text-base mb-2" style={{ color: '#6750a4' }}>
              Customer Payment
            </h5>
            <p className="text-slate-600 mb-3">
              Customer: <strong>{payCustomer.name}</strong>
              <br />
              Outstanding Balance: <span className="text-rose-600 font-bold">Rs. {payCustomer.balance.toFixed(2)}</span>
            </p>
            <form onSubmit={handlePaySubmit} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Enter Amount Received (Rs.)</label>
                <input
                  type="number"
                  step="any"
                  max={payCustomer.balance}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="form-control-regal font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setPayCustomer(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
