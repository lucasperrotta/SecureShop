import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getOrdersByUser, Order, updateOrderStatus } from '../utils/store';
import { useNavigate } from 'react-router-dom';

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setOrders(getOrdersByUser(user.id));
  }, [user, navigate]);

  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    pending: { label: 'Pendente', color: 'bg-yellow-600', icon: 'fa-clock' },
    confirmed: { label: 'Confirmado', color: 'bg-blue-600', icon: 'fa-check-circle' },
    shipping: { label: 'Em Trânsito', color: 'bg-purple-600', icon: 'fa-truck' },
    delivered: { label: 'Entregue', color: 'bg-green-600', icon: 'fa-box-open' },
    cancelled: { label: 'Cancelado', color: 'bg-red-600', icon: 'fa-times-circle' },
  };

  const simulateShipping = (orderId: string) => {
    updateOrderStatus(orderId, 'shipping');
    setOrders(getOrdersByUser(user!.id));
  };

  const simulateDelivery = (orderId: string) => {
    updateOrderStatus(orderId, 'delivered');
    setOrders(getOrdersByUser(user!.id));
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-white mb-2">Nenhum Pedido</h2>
          <p className="text-gray-400 mb-6">Você ainda não realizou nenhum pedido.</p>
          <button onClick={() => navigate('/products')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition">
            <i className="fas fa-store mr-2"></i>Ver Produtos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          <i className="fas fa-box mr-3 text-purple-400"></i>Meus Pedidos
        </h1>

        <div className="space-y-4">
          {orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => {
            const config = statusConfig[order.status];
            return (
              <div key={order.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-white font-mono font-bold">#{order.id}</p>
                    <p className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`${config.color} text-white text-xs px-3 py-1 rounded-full`}>
                      <i className={`fas ${config.icon} mr-1`}></i>{config.label}
                    </span>
                    <span className="text-green-400 font-bold">R$ {order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{item.productName} x{item.quantity}</span>
                        <span className="text-gray-400">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-700 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-400"><i className="fas fa-map-marker-alt mr-1"></i> Entrega: {order.shippingAddress.street}, {order.shippingAddress.number} - {order.shippingAddress.city}/{order.shippingAddress.state}</p>
                    {order.trackingCode && (
                      <p className="text-xs text-blue-300 mt-1"><i className="fas fa-barcode mr-1"></i> Rastreio: {order.trackingCode}</p>
                    )}
                    {order.cardLast4 && (
                      <p className="text-xs text-gray-400 mt-1"><i className="fas fa-credit-card mr-1"></i> Cartão final {order.cardLast4}</p>
                    )}
                  </div>

                  {order.status === 'confirmed' && (
                    <button onClick={() => simulateShipping(order.id)} className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
                      <i className="fas fa-truck mr-1"></i>Simular Envio
                    </button>
                  )}
                  {order.status === 'shipping' && (
                    <button onClick={() => simulateDelivery(order.id)} className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                      <i className="fas fa-box-open mr-1"></i>Simular Entrega
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
