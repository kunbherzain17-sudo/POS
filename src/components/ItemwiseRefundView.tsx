import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { Order, OrderItem } from '../types';

export const ItemwiseRefundView: React.FC = () => {
  const { orders, refundItem } = usePos();
  const [selectedItemForRefund, setSelectedItemForRefund] = useState<{
    order: Order;
    item: OrderItem;
  } | null>(null);

  const [refundQuantity, setRefundQuantity] = useState('1');
  const [refundBank, setRefundBank] = useState('1');
  const [searchOrder, setSearchOrder] = useState('');

  const allOrderItems = orders.flatMap((o) =>
    o.items.map((it) => ({
      order: o,
      item: it,
    }))
  );

  const filtered = allOrderItems.filter((row) => {
    if (!searchOrder.trim()) return true;
    const q = searchOrder.toLowerCase();
    return (
      row.order.orderId.toString().includes(q) ||
      row.item.name.toLowerCase().includes(q) ||
      row.order.customerName.toLowerCase().includes(q)
    );
  });

  const handleProcessRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForRefund) return;
    const qty = parseInt(refundQuantity) || 1;
    if (qty <= 0 || qty > selectedItemForRefund.item.quantity) {
      alert('Invalid refund quantity.');
      return;
    }

    const refundAmount = qty * selectedItemForRefund.item.price;
    refundItem(
      selectedItemForRefund.order.orderId,
      selectedItemForRefund.item.productId,
      qty,
      refundAmount
    );

    alert(`Refund of Rs. ${refundAmount.toFixed(2)} processed successfully for Order #${selectedItemForRefund.order.orderId}!`);
    setSelectedItemForRefund(null);
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '15px 20px', borderRadius: '4px' }}>
      <h4 style={{ textAlign: 'center', paddingTop: '0px !important', paddingBottom: '0px !important', fontWeight: 'bold' }}>
        Itemwise Refund
      </h4>

      <div className="my-3 flex justify-between items-center">
        <input
          type="text"
          value={searchOrder}
          onChange={(e) => setSearchOrder(e.target.value)}
          placeholder="Search by Order ID or Product..."
          className="form-control-regal"
          style={{ maxWidth: '300px' }}
        />
      </div>

      {/* Order items available for refund */}
      <div className="table-responsive overflow-x-auto">
        <table className="table table-striped regal-table w-full text-xs">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th style={{ textAlign: 'right' }}>Price</th>
              <th style={{ textAlign: 'center' }}>Sold Qty</th>
              <th style={{ textAlign: 'right' }}>Total Price</th>
              <th style={{ textAlign: 'center' }}>Date</th>
              <th style={{ textAlign: 'center', width: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 'bold' }}>#{row.order.orderId}</td>
                <td>{row.order.customerName}</td>
                <td style={{ fontWeight: 600 }}>{row.item.name}</td>
                <td style={{ textAlign: 'right' }}>{row.item.price.toFixed(2)}</td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{row.item.quantity}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{row.item.total.toFixed(2)}</td>
                <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{row.order.date}</td>
                <td style={{ textAlign: 'center' }}>
                  {row.item.quantity > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItemForRefund(row);
                        setRefundQuantity('1');
                      }}
                      className="btn btn-danger btn-sm px-2.5 py-0.5 text-xs font-bold"
                    >
                      Refund
                    </button>
                  ) : (
                    <span className="text-slate-400 font-medium">Returned</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Exact Refund Modal matching #refundModal */}
      {selectedItemForRefund && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-5 max-w-lg w-full shadow-2xl animate-scaleIn text-xs">
            <div className="flex justify-between items-center pb-2 border-b mb-3">
              <h5 className="font-bold text-base text-rose-600 m-0">Refund</h5>
              <button
                type="button"
                onClick={() => setSelectedItemForRefund(null)}
                className="text-slate-400 font-bold text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleProcessRefund} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="font-bold text-slate-700 block mb-1">Order id</label>
                  <input
                    type="text"
                    readOnly
                    value={selectedItemForRefund.order.orderId}
                    className="form-control-regal bg-slate-100 font-bold"
                  />
                </div>
                <div className="form-group">
                  <label className="font-bold text-slate-700 block mb-1">Product</label>
                  <input
                    type="text"
                    readOnly
                    value={selectedItemForRefund.item.name}
                    className="form-control-regal bg-slate-100 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="font-bold text-slate-700 block mb-1">Price</label>
                  <input
                    type="text"
                    readOnly
                    value={selectedItemForRefund.item.price.toFixed(2)}
                    className="form-control-regal bg-slate-100"
                  />
                </div>
                <div className="form-group">
                  <label className="font-bold text-slate-700 block mb-1">Original Quantity</label>
                  <input
                    type="text"
                    readOnly
                    value={selectedItemForRefund.item.quantity}
                    className="form-control-regal bg-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="font-bold text-slate-700 block mb-1">Refund Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedItemForRefund.item.quantity}
                    required
                    value={refundQuantity}
                    onChange={(e) => setRefundQuantity(e.target.value)}
                    className="form-control-regal font-bold"
                    style={{ borderBottom: 'solid 2px black' }}
                  />
                </div>
                <div className="form-group">
                  <label className="font-bold text-slate-700 block mb-1">Refund Amount</label>
                  <input
                    type="text"
                    readOnly
                    value={((parseInt(refundQuantity) || 0) * selectedItemForRefund.item.price).toFixed(2)}
                    className="form-control-regal bg-slate-100 font-bold text-rose-600"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="font-bold text-slate-700 block mb-1">Bank</label>
                <select
                  value={refundBank}
                  onChange={(e) => setRefundBank(e.target.value)}
                  className="form-control-regal"
                  style={{ borderBottom: 'solid 2px black' }}
                  required
                >
                  <option value="1">Cash</option>
                  <option value="7">easypaisa</option>
                  <option value="8">Ubl</option>
                  <option value="9">cash petty</option>
                  <option value="10">Feg</option>
                  <option value="11">soneri</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedItemForRefund(null)}
                  className="btn btn-secondary text-xs"
                >
                  Close
                </button>
                <button type="submit" className="btn btn-danger text-xs font-bold">
                  Confirm Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
