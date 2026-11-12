import React, { useState } from 'react';
import { usePos } from '../context/PosContext';

export const SalesView: React.FC = () => {
  const { orders, expenses } = usePos();
  const [filterDate, setFilterDate] = useState('');

  const allItems = orders.flatMap((o) =>
    o.items.map((it) => ({
      orderId: o.orderId,
      product: it.name,
      price: it.price,
      amountPaid: o.amountPaid,
      quantity: it.quantity,
      pDiscount: it.pDiscount,
      totalDiscount: o.totalDiscount,
      date: o.date,
    }))
  );

  const filteredItems = filterDate
    ? allItems.filter((i) => i.date === filterDate)
    : allItems;

  const filteredExpenses = filterDate
    ? expenses.filter((e) => e.date === filterDate)
    : expenses;

  const totalSalesAmount = orders
    .filter((o) => !filterDate || o.date === filterDate)
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div style={{ backgroundColor: '#fff', padding: '15px 20px', borderRadius: '4px' }}>
      <h4 style={{ textAlign: 'center', paddingTop: '0px !important', paddingBottom: '0px !important', fontWeight: 'bold' }}>
        Sales View
      </h4>

      <div className="my-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">Filter By Date:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="form-control-regal"
            style={{ width: '180px' }}
          />
          {filterDate && (
            <button
              type="button"
              onClick={() => setFilterDate('')}
              className="btn btn-secondary btn-sm text-xs"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex gap-4 text-xs font-bold">
          <div>
            Total Sales: <span className="text-purple-800 text-sm">Rs. {totalSalesAmount.toFixed(2)}</span>
          </div>
          <div>
            Total Expenses: <span className="text-rose-600 text-sm">Rs. {totalExpenseAmount.toFixed(2)}</span>
          </div>
          <div>
            Net Income: <span className="text-emerald-700 text-sm">Rs. {(totalSalesAmount - totalExpenseAmount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Sales and expense breakdown */}
      <div className="row flex flex-col lg:flex-row gap-4 mt-3">
        {/* Sold Products Table */}
        <div className="col-sm-6 flex-1">
          <h5 className="font-bold text-xs uppercase text-purple-900 mb-2 border-b pb-1">
            Sales Items Breakdown
          </h5>
          <div className="table-responsive" style={{ overflowX: 'auto', maxHeight: '450px' }}>
            <table className="table regal-table w-full text-xs">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Orderid</th>
                  <th>Product</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Am Paid</th>
                  <th style={{ textAlign: 'center' }}>Quantity</th>
                  <th style={{ textAlign: 'right' }}>P.Discount</th>
                  <th style={{ textAlign: 'right' }}>T.Discount</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold' }}>#{item.orderId}</td>
                    <td>{item.product}</td>
                    <td style={{ textAlign: 'right' }}>{item.price.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', color: '#28a745', fontWeight: 600 }}>
                      {item.amountPaid.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{item.pDiscount.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{item.totalDiscount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="col-sm-6 flex-1">
          <h5 className="font-bold text-xs uppercase text-rose-900 mb-2 border-b pb-1">
            Expenses Breakdown
          </h5>
          <div className="table-responsive" style={{ overflowX: 'auto', maxHeight: '450px' }}>
            <table className="table regal-table w-full text-xs">
              <thead>
                <tr>
                  <th>Expense Type</th>
                  <th>Expense</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id}>
                    <td style={{ fontWeight: 600 }}>{exp.type}</td>
                    <td>{exp.expense}</td>
                    <td style={{ textAlign: 'right', color: '#dc3545', fontWeight: 'bold' }}>
                      {exp.amount.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{exp.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
