import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Printer, X } from 'lucide-react';
import { Product } from '../types';

interface BarcodePrintModalProps {
  products: Product[];
  onClose: () => void;
}

const MAX_LABELS_PER_BATCH = 500;

export const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({ products, onClose }) => {
  const [copies, setCopies] = useState<Record<number, number>>(
    () => Object.fromEntries(products.map((product) => [product.id, 1]))
  );
  const [barcodeError, setBarcodeError] = useState('');
  const svgRefs = useRef(new Map<string, SVGSVGElement>());

  const labelCount = products.reduce((sum, product) => sum + (copies[product.id] || 0), 0);

  useEffect(() => {
    try {
      products.forEach((product) => {
        Array.from({ length: copies[product.id] || 0 }, (_, copyIndex) => {
          const svg = svgRefs.current.get(`${product.id}-${copyIndex}`);
          if (!svg) return;
          JsBarcode(svg, product.barcode, {
            format: 'CODE128',
            width: 1.5,
            height: 36,
            margin: 0,
            displayValue: false,
            lineColor: '#000000',
            background: '#ffffff',
          });
        });
      });
      setBarcodeError('');
    } catch (error) {
      setBarcodeError(error instanceof Error ? error.message : 'One or more barcode values cannot be printed.');
    }
  }, [copies, products]);

  const handlePrint = () => {
    if (labelCount < 1 || labelCount > MAX_LABELS_PER_BATCH || barcodeError) return;
    window.print();
  };

  return (
    <div className="barcode-print-overlay" role="presentation">
      <section className="barcode-print-dialog" role="dialog" aria-modal="true" aria-labelledby="barcode-print-title">
        <header className="barcode-print-controls">
          <div>
            <h2 id="barcode-print-title">Print product barcode labels</h2>
            <p>Code 128 labels · choose how many copies to print for each product.</p>
          </div>
          <button type="button" onClick={onClose} className="barcode-close-button" aria-label="Close barcode printing">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="barcode-print-product-list">
          {products.map((product) => (
            <label key={product.id} className="barcode-print-product">
              <span>
                <strong>{product.name}</strong>
                <small>{product.barcode}</small>
              </span>
              <span className="barcode-copy-control">
                <span>Labels</span>
                <input
                  type="number"
                  min="0"
                  max={MAX_LABELS_PER_BATCH}
                  value={copies[product.id] ?? 0}
                  onChange={(event) => {
                    const nextValue = Math.max(0, Math.min(MAX_LABELS_PER_BATCH, Number(event.target.value) || 0));
                    setCopies((previous) => ({ ...previous, [product.id]: nextValue }));
                  }}
                  aria-label={`Label copies for ${product.name}`}
                />
              </span>
            </label>
          ))}
        </div>

        <p className="barcode-batch-count">
          {labelCount} label{labelCount === 1 ? '' : 's'} selected
          {labelCount > MAX_LABELS_PER_BATCH && ` — print up to ${MAX_LABELS_PER_BATCH} per batch`}
        </p>
        {barcodeError && <p className="barcode-print-error" role="alert">{barcodeError}</p>}

        <div className="barcode-print-sheet" aria-hidden="true">
          {labelCount <= MAX_LABELS_PER_BATCH && products.flatMap((product) =>
            Array.from({ length: copies[product.id] || 0 }, (_, copyIndex) => (
              <article className="barcode-label" key={`${product.id}-${copyIndex}`}>
                <strong className="barcode-label-name">{product.name}</strong>
                <svg
                  ref={(element) => {
                    const refKey = `${product.id}-${copyIndex}`;
                    if (element) svgRefs.current.set(refKey, element);
                    else svgRefs.current.delete(refKey);
                  }}
                  className="barcode-label-svg"
                />
                <span className="barcode-label-number">{product.barcode}</span>
                <span className="barcode-label-price">Rs. {product.price.toFixed(2)}</span>
              </article>
            ))
          )}
        </div>

        <footer className="barcode-print-controls barcode-print-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePrint}
            disabled={labelCount < 1 || labelCount > MAX_LABELS_PER_BATCH || Boolean(barcodeError)}
          >
            <Printer size={15} className="mr-1 inline" aria-hidden="true" />
            Print {labelCount <= MAX_LABELS_PER_BATCH ? `${labelCount} labels` : 'batch'}
          </button>
        </footer>
      </section>
    </div>
  );
};
