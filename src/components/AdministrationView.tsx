import React, { useState, useRef } from 'react';
import { usePos } from '../context/PosContext';
import {
  Users,
  Store,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Save,
  Shield,
} from 'lucide-react';

interface AdminUserRecord {
  id: number;
  name: string;
  password: string;
  role: string;
  phone: string;
  cnic: string;
  address: string;
  permissions: string[];
}

export const AdministrationView: React.FC = () => {
  const {
    user,
    storeSettings,
    updateStoreSettings,
    exportDatabaseBackup,
    importDatabaseBackup,
    resetToDemoData,
  } = usePos();

  const [activeTab, setActiveTab] = useState<'users' | 'store' | 'database'>('users');
  const [showAddForm, setShowAddForm] = useState(false);

  // Store Settings Form state
  const [settingsForm, setSettingsForm] = useState(storeSettings);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [users, setUsers] = useState<AdminUserRecord[]>([
    {
      id: 1,
      name: 'Admin',
      password: '1234',
      role: 'Admin',
      phone: '03102673651',
      cnic: '42101-1234567-1',
      address: 'Karachi, Pakistan',
      permissions: [
        'Dashboard',
        'Product',
        'Customer',
        'Vendor',
        'Stock',
        'Expenses',
        'Invoice',
        'Sales View',
        'Duplicate Bill',
        'Refunds',
        'Banks',
        'Purchase Return',
      ],
    },
    {
      id: 2,
      name: 'cashier',
      password: '1234',
      role: 'cashier',
      phone: '03009988776',
      cnic: '42101-7654321-2',
      address: 'Counter 01',
      permissions: ['Invoice', 'Duplicate Bill', 'Refunds'],
    },
    {
      id: 3,
      name: 'Store Manager',
      password: '1234',
      role: 'Store Manager',
      phone: '03211122334',
      cnic: '42101-9988776-3',
      address: 'Store Main Floor',
      permissions: ['Dashboard', 'Product', 'Stock', 'Invoice', 'Sales View'],
    },
  ]);

  // User Form
  const [name, setName] = useState('');
  const [password, setPassword] = useState('1234');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [cnic, setCnic] = useState('');
  const [role, setRole] = useState('Admin');

  // Permissions Modal
  const [selectedUserForAccess, setSelectedUserForAccess] = useState<AdminUserRecord | null>(null);

  const allModules = [
    'Dashboard',
    'Product',
    'Discount',
    'Customer',
    'Vendor',
    'Salesman',
    'Stock',
    'Expenses',
    'Invoice',
    'Sales View',
    'Duplicate Bill',
    'Refunds',
    'Banks',
    'Purchase Return',
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newUser: AdminUserRecord = {
      id: users.length + 1,
      name: name.trim(),
      password: password || '1234',
      role,
      phone: phone.trim() || '0',
      address: address.trim() || '0',
      cnic: cnic.trim() || '0',
      permissions: [...allModules],
    };

    setUsers([...users, newUser]);
    setName('');
    setPassword('1234');
    setPhone('');
    setAddress('');
    setCnic('');
    setShowAddForm(false);
  };

  const handleTogglePermission = (mod: string) => {
    if (!selectedUserForAccess) return;
    const exists = selectedUserForAccess.permissions.includes(mod);
    const updatedPerms = exists
      ? selectedUserForAccess.permissions.filter((p) => p !== mod)
      : [...selectedUserForAccess.permissions, mod];

    const updatedUser = { ...selectedUserForAccess, permissions: updatedPerms };
    setSelectedUserForAccess(updatedUser);
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const handleSelectAll = (checked: boolean) => {
    if (!selectedUserForAccess) return;
    const updatedPerms = checked ? [...allModules] : [];
    const updatedUser = { ...selectedUserForAccess, permissions: updatedPerms };
    setSelectedUserForAccess(updatedUser);
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(settingsForm);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDatabaseBackup(content);
        if (success) {
          alert('Database restored successfully from JSON backup!');
          window.location.reload();
        } else {
          alert('Invalid backup file format. Please check the JSON file.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '15px 20px', borderRadius: '4px' }}>
      {/* Top Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b mb-4 gap-3">
        <div>
          <h4 className="font-bold text-lg text-slate-900 m-0">Administration & System Settings</h4>
          <p className="text-xs text-slate-500 m-0">
            Manage users, permissions, receipt headers, and 100% offline data backup
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              activeTab === 'users'
                ? 'bg-[#866ec7] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users & Access</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              activeTab === 'store'
                ? 'bg-[#866ec7] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Store & Receipt</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              activeTab === 'database'
                ? 'bg-[#866ec7] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Offline Backup</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: USERS & ACCESS CONTROL (Exact 1:1 Viewadmin.html)  */}
      {/* ========================================================= */}
      {activeTab === 'users' && (
        <div>
          <div className="button-container my-3 flex justify-between items-center">
            <button
              type="button"
              id="addNewBtn"
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-primary text-xs font-bold"
              style={{ backgroundColor: '#866ec7', borderColor: '#866ec7', color: '#fff' }}
            >
              {showAddForm ? '✕ Close Form' : '+ Add New Operator'}
            </button>

            <span className="text-xs text-slate-500">
              Total Operators: <strong>{users.length}</strong>
            </span>
          </div>

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
                    <label className="text-xs font-bold text-slate-700 block mb-1">Password:</label>
                    <input
                      className="form-control-regal"
                      required
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                </div>

                <div className="row grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
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
                  <div className="form-group">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Cnic:</label>
                    <input
                      className="form-control-regal"
                      required
                      type="text"
                      value={cnic}
                      onChange={(e) => setCnic(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Role:</label>
                    <select
                      className="form-control-regal"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="Admin">Admin</option>
                      <option value="cashier">cashier</option>
                      <option value="Store Manager">Store Manager</option>
                    </select>
                  </div>
                </div>

                <div className="form-group flex gap-2">
                  <button type="submit" className="btn btn-success text-xs font-bold">
                    Save User
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="btn btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users Table matching #productTable from Viewadmin.html */}
          <div className="table-responsive overflow-x-auto">
            <table className="table table-striped regal-table w-full text-xs" id="productTable">
              <thead>
                <tr>
                  <th style={{ display: 'none' }}>ID</th>
                  <th>Name</th>
                  <th>Password</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Cnic</th>
                  <th>Address</th>
                  <th style={{ textAlign: 'center', width: '150px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ display: 'none' }}>{u.id}</td>
                    <td style={{ fontWeight: 'bold' }}>{u.name}</td>
                    <td style={{ fontFamily: 'monospace' }}>••••</td>
                    <td>
                      <span
                        className="badge badge-primary px-2 py-1 rounded text-white font-semibold"
                        style={{ backgroundColor: '#866ec7' }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>{u.phone}</td>
                    <td>{u.cnic}</td>
                    <td>{u.address}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="btn-group flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedUserForAccess(u)}
                          className="btn btn-link text-info p-0 font-semibold text-xs"
                          style={{ color: '#17a2b8', textDecoration: 'none' }}
                        >
                          Access
                        </button>
                        {u.name !== 'Admin' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete user ${u.name}?`)) {
                                setUsers(users.filter((x) => x.id !== u.id));
                              }
                            }}
                            className="btn btn-link text-danger p-0 font-semibold text-xs"
                            style={{ color: '#dc3545', textDecoration: 'none' }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: STORE & RECEIPT SETTINGS (Customizes Bill & Slip)  */}
      {/* ========================================================= */}
      {activeTab === 'store' && (
        <div className="max-w-2xl bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h5 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
            <Store className="w-4 h-4 text-[#866ec7]" />
            <span>Store Profile & Printable Slip Header</span>
          </h5>

          {saveSuccessMsg && (
            <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Store profile & receipt settings saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Store / Company Name:
              </label>
              <input
                type="text"
                required
                value={settingsForm.storeName}
                onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                className="form-control-regal"
                placeholder="e.g. REGAL POS / Super Store"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tagline / Slogan:</label>
              <input
                type="text"
                value={settingsForm.tagline}
                onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                className="form-control-regal"
                placeholder="e.g. Point of Sale & Retail Management System"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Address / Location:</label>
              <input
                type="text"
                required
                value={settingsForm.address}
                onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                className="form-control-regal"
                placeholder="e.g. Trade Center, Gulshan-e-Iqbal, Karachi"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Phone:</label>
                <input
                  type="text"
                  required
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  className="form-control-regal"
                  placeholder="0310-2673651"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Currency Symbol:</label>
                <input
                  type="text"
                  required
                  value={settingsForm.currency}
                  onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                  className="form-control-regal"
                  placeholder="Rs."
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Receipt Footer Note:</label>
              <textarea
                rows={2}
                value={settingsForm.footerNote}
                onChange={(e) => setSettingsForm({ ...settingsForm, footerNote: e.target.value })}
                className="form-control-regal"
                placeholder="Thank You for Shopping! • Reliable Technologies"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="btn btn-success text-xs font-bold flex items-center gap-1.5 px-4 py-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Store Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: OFFLINE DATA MANAGEMENT (Backup / Restore / Reset)  */}
      {/* ========================================================= */}
      {activeTab === 'database' && (
        <div className="space-y-4 max-w-2xl text-xs">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <h5 className="font-bold text-sm text-purple-900 mb-1 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#866ec7]" />
              <span>100% Offline Database Architecture</span>
            </h5>
            <p className="text-slate-600 mb-3">
              Regal POS stores all your products, customers, suppliers, sales orders, and settings
              locally on this device. You can download a complete JSON backup anytime or restore
              it to another computer, tablet, or phone without requiring an internet connection.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={exportDatabaseBackup}
                className="btn btn-primary text-xs font-bold flex items-center gap-1.5 px-4 py-2"
                style={{ backgroundColor: '#866ec7', borderColor: '#866ec7' }}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Database JSON Backup</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-outline-secondary text-xs font-bold flex items-center gap-1.5 px-4 py-2 bg-white"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore from JSON File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-sm text-rose-900 mb-1">Reset to Clean Demo State</h5>
                <p className="text-slate-600 mb-3">
                  This will reload default products, sample customers, and vendors while preserving
                  the software structure. Useful for demonstrations or clearing test transactions.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        'Are you sure you want to reload default demo data? All local edits will be reset.'
                      )
                    ) {
                      resetToDemoData();
                      alert('Database reset to clean demo data.');
                      window.location.reload();
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-xs transition"
                >
                  Reset Demo Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Access Permissions Modal matching #accessModal */}
      {selectedUserForAccess && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-5 max-w-lg w-full shadow-2xl animate-scaleIn text-xs">
            <div className="flex justify-between items-center pb-2 border-b mb-3">
              <h5 className="font-bold text-base text-emerald-700 m-0">
                Access Permissions ({selectedUserForAccess.name})
              </h5>
              <button
                type="button"
                onClick={() => setSelectedUserForAccess(null)}
                className="text-slate-400 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="form-group pb-2 mb-2 border-b">
              <label className="flex items-center gap-2 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedUserForAccess.permissions.length === allModules.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span>Select All</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {allModules.map((mod) => (
                <label key={mod} className="flex items-center gap-2 cursor-pointer text-slate-800">
                  <input
                    type="checkbox"
                    checked={selectedUserForAccess.permissions.includes(mod)}
                    onChange={() => handleTogglePermission(mod)}
                  />
                  <span>{mod}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t mt-4">
              <button
                type="button"
                onClick={() => setSelectedUserForAccess(null)}
                className="btn btn-secondary text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Access permissions updated for ${selectedUserForAccess.name}!`);
                  setSelectedUserForAccess(null);
                }}
                className="btn btn-success text-xs font-bold"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
