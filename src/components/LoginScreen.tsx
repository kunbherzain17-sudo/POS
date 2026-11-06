import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Store } from 'lucide-react';
import { usePos } from '../context/PosContext';

export const LoginScreen: React.FC = () => {
  const { login, setupAdministrator, requiresSetup } = usePos();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (requiresSetup) {
        if (password !== confirmPassword) {
          setErrorMsg('The passwords do not match.');
          return;
        }
        await setupAdministrator(username, password);
        return;
      }

      const success = await login(username, password);
      if (!success) setErrorMsg('Check your sign-in details and try again.');
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Unable to save the local sign-in settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-brand-panel" aria-label="About Regal POS">
        <a className="login-brand-lockup" href="/" aria-label="Regal home">
          <span className="login-brand-mark"><Store size={23} aria-hidden="true" /></span>
          <span>Regal</span>
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
          <span>Customers</span>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-card">
          <div className="login-card-heading">
            <p className="login-store-label">Your store, all in one place</p>
            <h2>{requiresSetup ? 'Set up this device' : 'Welcome back'}</h2>
            <p>
              {requiresSetup
                ? 'Create this device’s administrator sign-in to get started.'
                : 'Sign in to pick up where you left off.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="login-username">Administrator username</label>
            <input
              id="login-username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              minLength={2}
              required
            />

            <label htmlFor="login-password">
              {requiresSetup ? 'Create password (at least 10 characters)' : 'Password'}
            </label>
            <div className="login-password-wrap">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={requiresSetup ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={requiresSetup ? 10 : 1}
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

            {requiresSetup && (
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

            <button type="submit" className="login-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait…' : requiresSetup ? 'Create administrator' : 'Sign in'}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>

          <p className="login-device-note">
            This install keeps its data on this device. Use a strong password and secure the device itself.
          </p>
        </div>
      </section>
    </main>
  );
};
