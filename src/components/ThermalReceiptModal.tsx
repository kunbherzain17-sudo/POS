import React, { useRef } from 'react';
import { Printer, X, CheckCircle, FileText, Download, Share2 } from 'lucide-react';
import { usePos } from '../context/PosContext';

export const ThermalReceiptModal: React.FC = () => {
  const { activePrintOrder, setActivePrintOrder, printFormat, setPrintFormat, storeSettings } = usePos();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!activePrintOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col my-8 animate-scaleIn">
        {/* Modal Header */}
        <div className="bg-[#49386f] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-sm">Invoice #{activePrintOrder.orderId}</h3>
              <p className="text-[11px] text-purple-200">Receipt Generated Successfully</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format toggle */}
            <div className="flex bg-white/20 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setPrintFormat('thermal')}
                className={`px-2 py-1 rounded font-medium transition ${
                  printFormat === 'thermal' ? 'bg-white text-purple-900 font-bold' : 'text-white'
                }`}
              >
                80mm Thermal
              </button>
              <button
                onClick={() => setPrintFormat('a4')}
                className={`px-2 py-1 rounded font-medium transition ${
                  printFormat === 'a4' ? 'bg-white text-purple-900 font-bold' : 'text-white'
                }`}
              >
                A4 Standard
              </button>
            </div>

            <button
              onClick={() => setActivePrintOrder(null)}
              className="p-1 rounded-lg hover:bg-white/20 text-white transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 bg-slate-50 flex-1 overflow-y-auto max-h-[70vh]">
          {printFormat === 'thermal' ? (
            /* 80mm Thermal Paper Mockup */
            <div
              ref={receiptRef}
              className="bg-white mx-auto p-4 shadow-md border border-slate-200 rounded max-w-[320px] font-mono text-[11px] leading-tight text-slate-900"
            >
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <h2 className="font-extrabold text-base tracking-wider uppercase">{storeSettings.storeName}</h2>
                <div className="text-[10px] text-slate-600 font-sans">
                  {storeSettings.tagline}
                </div>
                <div className="text-[9px] text-slate-500 mt-1">
                  {storeSettings.address}
                  <br />
                  Contact: {storeSettings.phone}
                </div>
              </div>

              <div className="py-2 border-b border-dashed border-slate-300 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Bill No:</span>
                  <span className="font-bold">#{activePrintOrder.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span>{activePrintOrder.date} {activePrintOrder.time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-bold truncate max-w-[150px]">{activePrintOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>{activePrintOrder.cashier}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="py-2 border-b border-dashed border-slate-300">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-left font-bold">
                      <th className="py-1">Item</th>
                      <th className="py-1 text-center">Qty</th>
                      <th className="py-1 text-right">Price</th>
                      <th className="py-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activePrintOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1 pr-1 truncate max-w-[120px]">{item.name}</td>
                        <td className="py-1 text-center">{item.quantity}</td>
                        <td className="py-1 text-right">{item.price.toFixed(0)}</td>
                        <td className="py-1 text-right font-bold">{item.total.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rs. {activePrintOrder.subtotal.toFixed(2)}</span>
                </div>
                {activePrintOrder.totalDiscount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount:</span>
                    <span>-Rs. {activePrintOrder.totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                {activePrintOrder.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax (GST):</span>
                    <span>Rs. {activePrintOrder.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-slate-300">
                  <span>NET TOTAL:</span>
                  <span>Rs. {activePrintOrder.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>Cash Paid:</span>
                  <span>Rs. {activePrintOrder.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-800">
                  <span>Change Return:</span>
                  <span>Rs. {activePrintOrder.changeDue.toFixed(2)}</span>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="pt-3 text-center space-y-1">
                <div className="flex justify-center items-center gap-0.5 h-7">
                  {Array.from({ length: 42 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-black h-full"
                      style={{ width: i % 3 === 0 ? '2px' : i % 5 === 0 ? '3px' : '1px' }}
                    />
                  ))}
                </div>
                <div className="text-[9px] tracking-widest text-slate-600">
                  *REGAL-{activePrintOrder.orderId}*
                </div>
                <div className="text-[9px] font-sans text-slate-500 pt-1">
                  {storeSettings.footerNote}
                </div>
              </div>
            </div>
          ) : (
            /* A4 Full Bill Format */
            <div className="bg-white p-6 shadow-md border border-slate-200 rounded text-xs space-y-4">
              <div className="flex justify-between items-start pb-4 border-b border-slate-300">
                <div>
                  <h2 className="text-xl font-extrabold text-[#6750A4]">{storeSettings.storeName}</h2>
                  <p className="text-slate-500 text-[11px]">{storeSettings.tagline}</p>
                  <p className="text-slate-500 text-[11px]">{storeSettings.address} • {storeSettings.phone}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-base font-bold text-slate-800">INVOICE</h3>
                  <p className="text-slate-600 font-semibold">#{activePrintOrder.orderId}</p>
                  <p className="text-slate-500 text-[11px]">{activePrintOrder.date} {activePrintOrder.time}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 bg-slate-50 p-3 rounded-lg">
                <div>
                  <span className="font-bold text-slate-700 block">Billed To:</span>
                  <span className="text-slate-800 font-semibold">{activePrintOrder.customerName}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-700 block">Payment Method:</span>
                  <span className="text-purple-700 font-semibold">{activePrintOrder.paymentMethod}</span>
                </div>
              </div>

              <table className="w-full text-xs">
                <thead className="bg-[#6750A4] text-white">
                  <tr>
                    <th className="p-2 text-left">Item Description</th>
                    <th className="p-2 text-center">Quantity</th>
                    <th className="p-2 text-right">Unit Price</th>
                    <th className="p-2 text-right">Discount</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activePrintOrder.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 font-medium">{it.name}</td>
                      <td className="p-2 text-center">{it.quantity}</td>
                      <td className="p-2 text-right">Rs. {it.price.toLocaleString()}</td>
                      <td className="p-2 text-right">Rs. {it.pDiscount.toLocaleString()}</td>
                      <td className="p-2 text-right font-bold">Rs. {it.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end pt-3">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="font-semibold">Rs. {activePrintOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Discount:</span>
                    <span>-Rs. {activePrintOrder.totalDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-300 pt-1 font-bold text-base text-[#6750A4]">
                    <span>Grand Total:</span>
                    <span>Rs. {activePrintOrder.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setActivePrintOrder(null)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Close Window
          </button>

          <button
            onClick={handlePrint}
            className="px-6 py-2.5 bg-[#6750A4] hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
