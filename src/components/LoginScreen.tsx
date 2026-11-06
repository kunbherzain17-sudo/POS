import React, { useState, useEffect } from 'react';
import { usePos } from '../context/PosContext';

export const LoginScreen: React.FC = () => {
  const { login } = usePos();
  const [role, setRole] = useState<'Admin' | 'cashier' | 'Store Manager'>('Admin');
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, role, password);
    if (!success) {
      setErrorMsg('Invalid credentials. Password is 1234.');
    }
  };

  const handleAdminClick = () => {
    setRole('Admin');
    setUsername('Admin');
    setPassword('1234');
  };

  const handleCashierClick = () => {
    setRole('cashier');
    setUsername('cashier');
    setPassword('1234');
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative font-sans select-none"
      style={{
        backgroundImage: "url('/assets/bg-login.jpg')",
        fontFamily: "'Lato', sans-serif",
      }}
    >
      {/* Background dark overlay like original */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-4xl px-4 py-8">
        {/* Welcome Message (shown for 2s then transitions) */}
        {showWelcome ? (
          <div
            id="welcome-message"
            onClick={() => setShowWelcome(false)}
            className="text-center cursor-pointer transition-all duration-700 animate-fadeIn"
            style={{
              fontSize: '2.4rem',
              color: 'white',
              textAlign: 'center',
              padding: '60px 0',
              fontWeight: 700,
              textShadow: '0 2px 10px rgba(0,0,0,0.6)',
            }}
          >
            Welcome to Regal POS
            <div className="text-sm font-normal text-purple-200 mt-2 opacity-80">
              Click anywhere to proceed
            </div>
          </div>
        ) : (
          /* Exact #login-form section from demo.regalpos.pk/Admin/Login */
          <div
            id="login-form"
            className="w-full max-w-3xl mx-auto rounded-2xl p-6 md:p-8 animate-fadeIn"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 0 25px rgba(0, 0, 0, 0.4)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.35)',
            }}
          >
            <div className="text-center mb-6">
              <h1
                className="heading-section"
                style={{
                  fontWeight: 'bold',
                  fontSize: '2.2rem',
                  letterSpacing: '1px',
                  color: '#fff',
                  margin: 0,
                }}
              >
                LOGIN
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-6">
              {/* Image Column */}
              <div className="image-column text-center flex flex-col items-center justify-center">
                <img
                  src="/assets/logo-login.png"
                  alt="Login Image"
                  className="w-48 max-w-full h-auto drop-shadow-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/regalposlogo.png';
                  }}
                />

                {/* Quick preset buttons matching original HTML #admin-button and #cashier-button */}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    id="admin-button"
                    onClick={handleAdminClick}
                    className="px-3 py-1.5 rounded bg-white/20 hover:bg-white/30 text-white text-xs font-semibold border border-white/30 transition"
                  >
                    Admin (1234)
                  </button>
                  <button
                    type="button"
                    id="cashier-button"
                    onClick={handleCashierClick}
                    className="px-3 py-1.5 rounded bg-white/20 hover:bg-white/30 text-white text-xs font-semibold border border-white/30 transition"
                  >
                    Cashier (1234)
                  </button>
                </div>
              </div>

              {/* Login Wrap */}
              <div className="login-wrap p-0">
                <form onSubmit={handleSubmit} className="signin-form space-y-3.5">
                  <div className="form-group">
                    <select
                      name="ad_role"
                      id="ad_role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-md text-sm text-white focus:outline-none"
                      style={{
                        background: 'rgba(255, 255, 255, 0.25)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        height: '42px',
                      }}
                    >
                      <option value="" disabled style={{ color: '#000' }}>Role</option>
                      <option value="Admin" style={{ color: '#000' }}>Admin</option>
                      <option value="cashier" style={{ color: '#000' }}>cashier</option>
                      <option value="Store Manager" style={{ color: '#000' }}>Store Manager</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      id="ad_name"
                      name="ad_name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="off"
                      placeholder="Username"
                      required
                      className="w-full px-3 py-2.5 rounded-md text-sm text-white placeholder-white/70 focus:outline-none"
                      style={{
                        background: 'rgba(255, 255, 255, 0.25)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        height: '42px',
                      }}
                    />
                  </div>

                  <div className="form-group relative">
                    <input
                      id="password-field"
                      name="ad_password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="off"
                      placeholder="Password"
                      required
                      className="w-full px-3 py-2.5 rounded-md text-sm text-white placeholder-white/70 focus:outline-none pr-10"
                      style={{
                        background: 'rgba(255, 255, 255, 0.25)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        height: '42px',
                      }}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className={`fa fa-fw ${showPassword ? 'fa-eye-slash' : 'fa-eye'} field-icon toggle-password absolute right-3 top-3 text-white/80 hover:text-white cursor-pointer`}
                      style={{ fontSize: '16px' }}
                    />
                  </div>

                  {errorMsg && (
                    <div
                      className="error-message p-2 text-center text-xs rounded"
                      style={{
                        color: '#ffcccc',
                        background: 'rgba(255, 0, 0, 0.2)',
                      }}
                    >
                      {errorMsg}
                    </div>
                  )}

                  <div className="form-group pt-1">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-3 rounded-lg text-sm font-bold uppercase transition duration-300 submit"
                      style={{
                        background: 'rgba(173, 216, 230, 0.3)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        borderRadius: '8px',
                        letterSpacing: '0.8px',
                        boxShadow: '0 0 10px rgba(173, 216, 230, 0.5)',
                        backdropFilter: 'blur(8px)',
                        height: '42px',
                      }}
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Authentic Footer Note & Contacts */}
            <div className="row text-center mt-6 pt-4 border-t border-white/20 space-y-1">
              <h6
                style={{
                  fontWeight: 'bold',
                  color: 'white',
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  margin: 0,
                  opacity: 0.95,
                }}
              >
                Designed and Developed By Reliable Technologies
              </h6>

              <div
                className="justify-content-center text-center"
                style={{
                  fontWeight: 'bold',
                  color: 'white',
                  fontSize: '0.8rem',
                }}
              >
                <a
                  href="tel:+923102673651"
                  style={{ fontWeight: 'bold', color: 'white', textDecoration: 'none' }}
                >
                  Contact/Whatsapp: +92 310 2673651
                </a>{' '}
                <a
                  href="https://reliabletech.pk/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontWeight: 'bold', color: 'white', textDecoration: 'none' }}
                >
                  | Website : www.reliabletech.pk
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
