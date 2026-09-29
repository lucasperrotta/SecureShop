import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { checkPasswordStrength } from '../utils/security';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = checkPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/products');
      } else {
        setError(result.message);
      }
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-white">SecureShop</h1>
          <p className="text-gray-400 mt-2">Acesso seguro ao sistema</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-xs text-green-400"><i className="fas fa-lock"></i> Conexão Criptografada</span>
            <span className="text-xs text-gray-500">|</span>
            <span className="text-xs text-blue-400"><i className="fas fa-shield-alt"></i> OWASP Compliant</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
              <i className="fas fa-exclamation-triangle mr-2"></i>{error}
            </div>
          )}

          <div className="mb-5">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              <i className="fas fa-envelope mr-2"></i>Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-5">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              <i className="fas fa-key mr-2"></i>Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded ${i < passwordStrength.score ? `bg-${passwordStrength.color}-500` : 'bg-gray-600'}`} 
                      style={{ backgroundColor: i < passwordStrength.score ? (passwordStrength.color === 'emerald' ? '#10b981' : passwordStrength.color === 'yellow' ? '#eab308' : passwordStrength.color) : undefined }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400 mt-1">{passwordStrength.label}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Autenticando...</>
            ) : (
              <><i className="fas fa-sign-in-alt"></i> Entrar</>
            )}
          </button>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/recovery" className="text-blue-400 hover:text-blue-300 transition">
              Esqueci minha senha
            </Link>
            <Link to="/register" className="text-green-400 hover:text-green-300 transition">
              Criar conta
            </Link>
          </div>
        </form>

        <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            <i className="fas fa-info-circle mr-1"></i>
            Protegido com: Hash PBKDF2 (10.000 iterações) • Rate Limiting • Session Timeout • CSRF Protection • 2FA
          </p>
        </div>
      </div>
    </div>
  );
}
