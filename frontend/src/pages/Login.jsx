import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { settings } = useSettings();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message || 'Invalid credentials or login error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Mandi Logo */}
        <div className="inline-flex items-center justify-center mb-3">
          <img 
            src="/deva-logo.png" 
            alt="DEVA & CO" 
            className="w-20 h-20 object-contain rounded-2xl shadow-subtle bg-white p-1.5 border border-surface-border"
          />
        </div>

        <h1 className="text-2xl font-bold text-content-main font-tamil tracking-tight">
          {settings.storeName || 'தேவா & கோ'}
        </h1>
        <p className="text-xs font-semibold text-forest-600 font-tamil mt-0.5">
          {settings.tagline || 'தக்காளி & காய்கனி கமிஷன் மண்டி'}
        </p>
        <p className="text-[11px] text-content-secondary font-tamil mt-1">
          {settings.address || '54 A, அண்ணல் காந்தி மார்க்கெட், திண்டுக்கல் – 624 001'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl shadow-card border border-surface-border">
          <div className="text-center mb-6">
            <h2 className="text-base font-bold text-content-main">
              Wholesale Mandi System Login
            </h2>
            <p className="text-xs text-content-secondary mt-0.5">
              Sign in to manage sales, purchases, and tally balances
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-status-dangerLight border border-status-danger/20 rounded-lg text-xs text-status-danger font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-status-danger" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-content-main mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-content-secondary absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="admin or accountant"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600 bg-surface-bg font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-content-main mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-content-secondary absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600 bg-surface-bg font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-forest-600 hover:bg-forest-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Preset Buttons */}
          <div className="mt-6 pt-5 border-t border-surface-border text-center">
            <p className="text-[11px] text-content-secondary mb-2 font-medium">Quick Credentials Fill:</p>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'Admin@123')}
                className="px-3 py-1 bg-surface-bg hover:bg-surface-hover text-content-main border border-surface-border rounded text-xs font-medium"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('accountant', 'Deva@123')}
                className="px-3 py-1 bg-surface-bg hover:bg-surface-hover text-content-main border border-surface-border rounded text-xs font-medium"
              >
                Staff (Accountant)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-content-secondary font-tamil">
          {settings.footerNote || 'தாங்கள் வருகை நல்வரவு !'}
        </div>
      </div>
    </div>
  );
};

export default Login;
