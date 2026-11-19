import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf, Lock, Mail, ArrowRight, Shield, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, 'password123');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed. Make sure database is seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Leaf className="w-7 h-7 text-slate-950 fill-slate-950" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          Sign in to CEAMS
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Centralized Environmental Audit Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-950/80 border border-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center space-x-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Email address
              </label>
              <div className="mt-1.5 relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <div className="mt-1.5 relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              Quick Demo Access (1-Click)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@example.com')}
                className="p-2 text-left bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
              >
                <p className="text-xs font-bold text-white">Administrator</p>
                <p className="text-[10px] text-teal-400">admin@example.com</p>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('auditor@example.com')}
                className="p-2 text-left bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
              >
                <p className="text-xs font-bold text-white">Env. Auditor</p>
                <p className="text-[10px] text-teal-400">auditor@example.com</p>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('manager@example.com')}
                className="p-2 text-left bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
              >
                <p className="text-xs font-bold text-white">Site Manager</p>
                <p className="text-[10px] text-teal-400">manager@example.com</p>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('compliance@example.com')}
                className="p-2 text-left bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
              >
                <p className="text-xs font-bold text-white">Compliance Officer</p>
                <p className="text-[10px] text-teal-400">compliance@example.com</p>
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              Need a new account?{' '}
              <Link to="/register" className="text-teal-400 hover:text-teal-300 font-semibold">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
