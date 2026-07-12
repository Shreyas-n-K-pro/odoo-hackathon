import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';

import { RetroGrid } from '../components/RetroGrid';
import logo from '../logo.avif';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const demoAccounts = [
    { email: 'admin@transitops.com', password: 'admin123', role: 'Super Admin' },
    { email: 'manager@transitops.com', password: 'manager123', role: 'Fleet Manager' },
    { email: 'dispatcher@transitops.com', password: 'disp123', role: 'Dispatcher' },
    { email: 'safety@transitops.com', password: 'safety123', role: 'Safety Officer' },
    { email: 'analyst@transitops.com', password: 'analyst123', role: 'Financial Analyst' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setError('');
    setIsLoading(true);
    try {
      await login(demoEmail, demoPassword);
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7FAFC] dark:bg-[#091A20] flex items-center justify-center p-4">
      {/* Background Retro Grid */}
      <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden pointer-events-none select-none z-0">
        <RetroGrid />
      </div>
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center justify-center gap-2 mb-4">
            <img src={logo} alt="TransitOps Logo" className="w-14 h-14 object-contain rounded-md mb-1" />
            <h1 className="text-3xl font-bold text-teal-600 dark:text-teal-400">TransitOps</h1>
          </div>
          <p className="text-light-secondary-text dark:text-dark-secondary-text">Smart Transport Operations Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-lg p-8 mb-6 relative z-10">
          {error && <Alert type="error" title="Login Error" message={error} />}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-light-primary-text dark:text-dark-primary-text mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-primary-text dark:text-dark-primary-text focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-light-primary-text dark:text-dark-primary-text mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-primary-text dark:text-dark-primary-text focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              variant="primary"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-light-border dark:border-dark-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-light-card dark:bg-dark-card text-light-secondary-text dark:text-dark-secondary-text">
                Demo Accounts
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => handleDemoLogin(account.email, account.password)}
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-lg border border-teal-600 text-teal-600 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {account.role}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-light-secondary-text dark:text-dark-secondary-text text-sm">
          Hackathon Project • TransitOps v1.0
        </p>
      </div>
    </div>
  );
};
