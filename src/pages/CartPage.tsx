import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-white mb-2">Carrinho Vazio</h2>
          <p className="text-gray-400 mb-6">Adicione produtos ao seu carrinho.</p>
          <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition">
            <i className="fas fa-store mr-2"></i>Ver Produtos
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          <i className="fas fa-shopping-cart mr-3 text-blue-400"></i>Carrinho de Compras
        </h1>

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <span className="text-gray-300">{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
            <button onClick={clearCart} className="text-red-400 hover:text-red-300 text-sm transition">
              <i className="fas fa-trash mr-1"></i>Limpar carrinho
            </button>
          </div>

          {items.map(item => (
            <div key={item.product.id} className="p-4 border-b border-gray-700 flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                {item.product.image}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{item.product.name}</h3>
                <p className="text-gray-400 text-sm">{item.product.category}</p>
                <p className="text-green-400 font-semibold">R$ {item.product.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center transition">
                  <i className="fas fa-minus text-xs"></i>
                </button>
                <span className="text-white w-8 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center transition">
                  <i className="fas fa-plus text-xs"></i>
                </button>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">R$ {(item.product.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-300 text-sm mt-1">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          ))}

          <div className="p-4 bg-gray-750">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Subtotal</span>
              <span className="text-white">R$ {total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Frete</span>
              <span className="text-green-400">Grátis</span>
            </div>
            <div className="border-t border-gray-600 pt-2 mt-2 flex items-center justify-between">
              <span className="text-white font-bold text-lg">Total</span>
              <span className="text-green-400 font-bold text-2xl">R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <Link to="/products" className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg text-center transition">
            <i className="fas fa-arrow-left mr-2"></i>Continuar Comprando
          </Link>
          <button onClick={handleCheckout} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition">
            <i className="fas fa-lock mr-2"></i>Finalizar Compra Segura
          </button>
        </div>

        <div className="mt-4 bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            <i className="fas fa-shield-alt mr-1 text-green-400"></i>
            Pagamento processado com criptografia AES-256 • Dados do cartão nunca armazenados em texto plano
          </p>
        </div>
      </div>
    </div>
  );
}
