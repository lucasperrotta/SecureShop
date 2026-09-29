import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { getAuditLogs } from '../utils/security';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const securityLevel = isAuthenticated ? (() => {
    const logs = getAuditLogs();
    const recentWarnings = logs.filter(l => l.severity !== 'info' && Date.now() - new Date(l.timestamp).getTime() < 3600000).length;
    if (recentWarnings > 3) return { label: 'Alto', color: 'text-red-400' };
    if (recentWarnings > 0) return { label: 'Médio', color: 'text-yellow-400' };
    return { label: 'Normal', color: 'text-green-400' };
  })() : null;

  return (
    <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white hover:text-blue-400 transition">
          <span className="text-2xl">🔒</span>
          <span className="font-bold text-lg">SecureShop</span>
          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">SSL</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/products" className="text-gray-300 hover:text-white transition text-sm">
            <i className="fas fa-store mr-1"></i> Produtos
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/sell" className="text-gray-300 hover:text-white transition text-sm">
                <i className="fas fa-tag mr-1"></i> Vender
              </Link>
              <Link to="/orders" className="text-gray-300 hover:text-white transition text-sm">
                <i className="fas fa-box mr-1"></i> Pedidos
              </Link>
              <Link to="/cart" className="text-gray-300 hover:text-white transition text-sm relative">
                <i className="fas fa-shopping-cart mr-1"></i> Carrinho
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="text-gray-300 hover:text-white transition text-sm">
                <i className="fas fa-user mr-1"></i> {user?.name?.split(' ')[0]}
              </Link>
              {securityLevel && (
                <span className={`text-xs ${securityLevel.color}`}>
                  <i className="fas fa-shield-alt mr-1"></i>{securityLevel.label}
                </span>
              )}
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm transition">
                <i className="fas fa-sign-out-alt mr-1"></i> Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white transition text-sm">
                <i className="fas fa-sign-in-alt mr-1"></i> Entrar
              </Link>
              <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm transition">
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
