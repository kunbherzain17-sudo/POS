import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Store } from 'lucide-react';
import { usePos } from '../context/PosContext';

export const LoginScreen: React.FC = () => {
  const { cloudConfigured, login, registerBusiness } = usePos();
  const [mode, setMode] = useState<'sign_in' | 'register'>('sign_in');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg('');
    setNotice('');
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          setErrorMsg('The passwords do not match.');
          return;
        }
        const signedIn = await registerBusiness(storeName, email, password);
        if (!signedIn) {
          setNotice('Check your email for a confirmation link, then sign in to continue.');
        }
        return;
      }

      await login(email, password);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Unable to connect to your cloud account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-brand-panel" aria-label="About Asaan POS">
        <a className="login-brand-lockup" href="/" aria-label="Asaan POS home">
          <span className="login-brand-mark"><Store size={23} aria-hidden="true" /></span>
          <span>Asaan POS</span>
        </a>
        <div className="login-brand-message">
          <p>Made for the shop floor</p>
          <h1>Keep the day<br />moving.</h1>
          <p className="login-brand-description">
            Ring up sales, keep an eye on stock, and look after the people who keep you in business.
          </p>
        </div>
        <div className="login-capabilities" aria-label="Available tools">
          <span>Point of sale</span>
          <span>Inventory</span>
          <span>Cloud synced</span>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-card">
          <div className="login-card-heading">
            <p className="login-store-label">Your store, securely in the cloud</p>
            <h2>{mode === 'register' ? 'Create your account' : 'Welcome back'}</h2>
            <p>
              {mode === 'register'
                ? 'Create one account for your business and its store.'
                : 'Sign in to securely access your store from any device.'}
            </p>
          </div>

          {!cloudConfigured && (
            <p className="login-error" role="alert">
              Cloud sign-in is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the deployment environment.
            </p>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {mode === 'register' && (
              <>
                <label htmlFor="login-store-name">Business / store name</label>
                <input
                  id="login-store-name"
                  name="store-name"
                  type="text"
                  autoComplete="organization"
                  value={storeName}
                  onChange={(event) => setStoreName(event.target.value)}
                  minLength={2}
                  maxLength={120}
                  required
                />
              </>
            )}

            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="login-password">
              {mode === 'register' ? 'Create password (at least 10 characters)' : 'Password'}
            </label>
            <div className="login-password-wrap">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={mode === 'register' ? 10 : 1}
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword
                  ? <EyeOff size={17} aria-hidden="true" />
                  : <Eye size={17} aria-hidden="true" />}
              </button>
            </div>

            {mode === 'register' && (
              <>
                <label htmlFor="login-confirm-password">Confirm password</label>
                <input
                  id="login-confirm-password"
                  name="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={10}
                  required
                />
              </>
            )}

            {errorMsg && <p className="login-error" role="alert">{errorMsg}</p>}
            {notice && <p className="login-notice" role="status">{notice}</p>}

            <button type="submit" className="login-submit" disabled={isSubmitting || !cloudConfigured}>
              {isSubmitting ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>

          <button
            type="button"
            className="login-mode-switch"
            onClick={() => {
              setMode(mode === 'register' ? 'sign_in' : 'register');
              setErrorMsg('');
              setNotice('');
            }}
          >
            {mode === 'register' ? 'Already have an account? Sign in' : 'New to Asaan POS? Create an account'}
          </button>
          <button
            type="button"
            className="login-demo-button"
            onClick={() => window.location.assign(`${window.location.pathname}?demo=1`)}
          >
            Explore the interactive demo
          </button>
          <p className="login-demo-note">
            The demo uses sample data. Your changes are temporary and reset when you leave.
          </p>
          <p className="login-device-note">
            Store records are saved to your account in the cloud, not kept as a device-only store.
          </p>
        </div>
      </section>
    </main>
  );
};
