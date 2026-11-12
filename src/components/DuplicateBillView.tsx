import React, { useState } from 'react';
import { usePos } from '../context/PosContext';

export const DuplicateBillView: React.FC = () => {
  const { orders, setActivePrintOrder } = usePos();
  const [searchString, setSearchString] = useState('');

  const filteredOrders = orders.filter((o) => {
    if (!searchString.trim()) return true;
    const q = searchString.toLowerCase();
    return (
      o.orderId.toString().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.date.includes(q)
    );
  });

  return (
    <div className="data-view-panel" style={{ backgroundColor: '#fff', padding: '15px 20px', borderRadius: '4px' }}>
      <h4 style={{ textAlign: 'center', paddingTop: '0px !important', paddingBottom: '0px !important', fontWeight: 'bold' }}>
        Duplicate Bill
      </h4>

      <div className="my-3 flex justify-between items-center">
        <input
          type="text"
          value={searchString}
          onChange={(e) => setSearchString(e.target.value)}
          placeholder="Search by Order ID or Customer..."
          className="form-control-regal"
          style={{ maxWidth: '300px' }}
        />
        <span className="text-xs text-slate-500 font-semibold">
          Total Invoices: {orders.length}
        </span>
      </div>

      {/* Invoice search results */}
      <div className="table-responsive overflow-x-auto">
        <table className="table table-striped table-hover mb-0 regal-table w-full text-xs">
          <thead className="table-light">
            <tr>
              <th style={{ width: '80px' }}>Order ID</th>
              <th>Customer</th>
              <th style={{ textAlign: 'right' }}>Total Price</th>
              <th style={{ textAlign: 'right' }}>Amount Paid</th>
              <th style={{ textAlign: 'right' }}>Discount</th>
              <th style={{ textAlign: 'center' }}>Date</th>
              <th style={{ textAlign: 'center', width: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((ord) => (
              <tr key={ord.orderId}>
                <td data-label="Order ID" className="orderid font-bold text-slate-800">#{ord.orderId}</td>
                <td data-label="Customer" className="font-semibold text-slate-900">{ord.customerName}</td>
                <td data-label="Total price" style={{ textAlign: 'right', fontWeight: 'bold' }}>{ord.totalPrice.toFixed(2)}</td>
                <td data-label="Amount paid" style={{ textAlign: 'right', color: '#28a745', fontWeight: 600 }}>
                  {ord.amountPaid.toFixed(2)}
                </td>
                <td data-label="Discount" style={{ textAlign: 'right', color: ord.totalDiscount > 0 ? 'red' : 'inherit' }}>
                  {ord.totalDiscount.toFixed(2)}
                </td>
                <td data-label="Date" style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                  {ord.date} {ord.time}
                </td>
                <td data-label="Actions" style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setActivePrintOrder(ord)}
                    className="btn btn-success stockreport btn-sm px-3 py-1 text-xs font-bold"
                  >
                    Print
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
