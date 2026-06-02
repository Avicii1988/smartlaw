import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import api from '../lib/api';

export function LoginPage() {
  const [email, setEmail] = useState('admin@lexflow.ch');
  const [password, setPassword] = useState('lexflow123');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.token);
      navigate('/');
    } catch {
      setError('Ungültige Anmeldedaten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#185FA5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4 border border-white/20">
            <Scale size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">LexFlow</h1>
          <p className="text-white/60 mt-1">Schweizer Kanzleisoftware</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Anmelden</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">E-Mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
                  placeholder="anwalt@kanzlei.ch"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Passwort</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-[#185FA5] font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-white/40 text-xs text-center mb-3">Demo-Zugänge</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { email: 'admin@lexflow.ch', label: 'Admin' },
                { email: 'mueller@lexflow.ch', label: 'Anwalt' },
              ].map(({ email: e, label }) => (
                <button
                  key={e}
                  onClick={() => { setEmail(e); setPassword('lexflow123'); }}
                  className="text-xs text-white/50 hover:text-white/80 bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors text-left"
                >
                  <div className="font-medium">{label}</div>
                  <div className="truncate">{e}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
