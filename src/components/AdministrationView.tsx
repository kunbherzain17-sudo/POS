import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle, Database, Download, Save, Store, Upload } from 'lucide-react';
import { usePos } from '../context/PosContext';

export const AdministrationView: React.FC = () => {
  const {
    storeSettings,
    updateStoreSettings,
    exportDatabaseBackup,
    importDatabaseBackup,
    resetToCleanData,
  } = usePos();
  const [settingsForm, setSettingsForm] = useState(storeSettings);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [restoreError, setRestoreError] = useState('');
  const [restoreSuccess, setRestoreSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setSettingsForm(storeSettings), [storeSettings]);

  const handleSaveSettings = (event: React.FormEvent) => {
    event.preventDefault();
    updateStoreSettings(settingsForm);
    setSaveSuccessMsg(true);
    window.setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setRestoreError('');
    setRestoreSuccess('');

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setRestoreError('The selected backup could not be read as text.');
        return;
      }
      let restored: boolean;
      try {
        restored = importDatabaseBackup(reader.result);
      } catch (error) {
        setRestoreError(error instanceof Error ? `Restore failed: ${error.message}` : 'Restore failed.');
        return;
      }
      if (!restored) {
        setRestoreError('This file is not a valid Asaan POS backup.');
        return;
      }
      setRestoreSuccess('Backup restored on this device.');
    };
    reader.onerror = () => setRestoreError('The selected backup could not be read.');
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleReset = () => {
    if (!window.confirm(
      'This permanently deletes this device’s saved products, customers, suppliers, expenses, sales, held bills, categories, and store settings. Your administrator sign-in will be kept. Continue?'
    )) {
      return;
    }
    resetToCleanData();
    window.location.reload();
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '15px 20px', borderRadius: '4px' }}>
      <header className="pb-3 border-b mb-4">
        <h4 className="font-bold text-lg text-slate-900 m-0">Store & Device Settings</h4>
        <p className="text-xs text-slate-500 m-0">
          Configure your receipt, back up this device, or reset its saved store data.
        </p>
      </header>

      <section className="max-w-2xl bg-slate-50 p-5 rounded-xl border border-slate-200 mb-4">
        <h5 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
          <Store className="w-4 h-4 text-[#6750a4]" aria-hidden="true" />
          <span>Store Profile & Receipt</span>
        </h5>

        {saveSuccessMsg && (
          <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2" role="status">
            <CheckCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Store profile and receipt settings saved.</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
          <div>
            <label htmlFor="store-name" className="font-bold text-slate-700 block mb-1">Store / Company Name</label>
            <input
              id="store-name"
              type="text"
              required
              value={settingsForm.storeName}
              onChange={(event) => setSettingsForm({ ...settingsForm, storeName: event.target.value })}
              className="form-control-regal"
              placeholder="Your store name"
            />
          </div>

          <div>
            <label htmlFor="store-tagline" className="font-bold text-slate-700 block mb-1">Tagline</label>
            <input
              id="store-tagline"
              type="text"
              value={settingsForm.tagline}
              onChange={(event) => setSettingsForm({ ...settingsForm, tagline: event.target.value })}
              className="form-control-regal"
            />
          </div>

          <div>
            <label htmlFor="store-address" className="font-bold text-slate-700 block mb-1">Address (optional)</label>
            <input
              id="store-address"
              type="text"
              value={settingsForm.address}
              onChange={(event) => setSettingsForm({ ...settingsForm, address: event.target.value })}
              className="form-control-regal"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="store-phone" className="font-bold text-slate-700 block mb-1">Contact Phone (optional)</label>
              <input
                id="store-phone"
                type="text"
                value={settingsForm.phone}
                onChange={(event) => setSettingsForm({ ...settingsForm, phone: event.target.value })}
                className="form-control-regal"
              />
            </div>
            <div>
              <label htmlFor="store-currency" className="font-bold text-slate-700 block mb-1">Currency Symbol</label>
              <input
                id="store-currency"
                type="text"
                required
                value={settingsForm.currency}
                onChange={(event) => setSettingsForm({ ...settingsForm, currency: event.target.value })}
                className="form-control-regal"
              />
            </div>
          </div>

          <div>
            <label htmlFor="store-footer" className="font-bold text-slate-700 block mb-1">Receipt Footer Note</label>
            <textarea
              id="store-footer"
              rows={2}
              value={settingsForm.footerNote}
              onChange={(event) => setSettingsForm({ ...settingsForm, footerNote: event.target.value })}
              className="form-control-regal"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button type="submit" className="btn btn-success text-xs font-bold flex items-center gap-1.5 px-4 py-2">
              <Save className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Save Store Settings</span>
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4 max-w-2xl text-xs">
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <h5 className="font-bold text-sm text-purple-900 mb-1 flex items-center gap-2">
            <Database className="w-4 h-4 text-[#6750a4]" aria-hidden="true" />
            <span>On-device data & backup</span>
          </h5>
          <p className="text-slate-600 mb-3">
            This installation stores its records in this browser on this device. Separate devices do not sync.
            Export a JSON backup and transfer it yourself to move data between devices. The backup does not
            contain your administrator password.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportDatabaseBackup}
              className="btn btn-primary text-xs font-bold flex items-center gap-1.5 px-4 py-2"
              style={{ backgroundColor: '#6750a4', borderColor: '#6750a4' }}
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Download JSON Backup</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-outline-secondary text-xs font-bold flex items-center gap-1.5 px-4 py-2 bg-white"
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Restore from JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileImport}
              className="hidden"
              aria-label="Select an Asaan POS JSON backup"
            />
          </div>
          {restoreError && <p className="mt-2 text-rose-700" role="alert">{restoreError}</p>}
          {restoreSuccess && <p className="mt-2 text-emerald-700" role="status">{restoreSuccess}</p>}
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <h5 className="font-bold text-sm text-amber-900 mb-1">Local sign-in limitations</h5>
          <p className="text-slate-600">
            Each device has one administrator sign-in. It is a basic app lock, not encryption; protect the
            device with its operating-system account and disk encryption.
          </p>
        </div>

        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h5 className="font-bold text-sm text-rose-900 mb-1">Clear this device’s store data</h5>
              <p className="text-slate-600 mb-3">
                Permanently remove local business records and restore clean starting data. This does not
                delete the administrator sign-in or affect data on other devices.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-xs transition"
              >
                Reset local store data
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
