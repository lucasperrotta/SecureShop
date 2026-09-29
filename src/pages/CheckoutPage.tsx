import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../utils/store';
import { validateCreditCard, formatCreditCard, maskCreditCard, getCardBrand } from '../utils/validators';
import { logAudit } from '../utils/security';
import { useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [useSavedAddress, setUseSavedAddress] = useState(true);

  if (!user) { navigate('/login'); return null; }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateCreditCard(cardNumber)) {
      setError('Número do cartão inválido.');
      return;
    }
    if (!cardHolder.trim()) { setError('Nome no cartão é obrigatório.'); return; }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) { setError('Data de validade inválida (MM/AA).'); return; }
    if (!/^\d{3,4}$/.test(cardCVV)) { setError('CVV inválido.'); return; }

    setLoading(true);
    try {
      const order = createOrder({
        userId: user.id,
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        total,
        status: 'confirmed',
        shippingAddress: useSavedAddress ? user.address : user.address,
        paymentMethod: 'credit_card',
        cardLast4: cardNumber.replace(/\D/g, '').slice(-4),
      });

      logAudit('PAYMENT_PROCESSED', user.id, `Pagamento processado - Pedido: ${order.id} - Valor: R$ ${total.toFixed(2)}`);
      
      setOrderId(order.id);
      clearCart();
      setStep(3);
    } catch {
      setError('Erro ao processar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          <i className="fas fa-lock mr-3 text-green-400"></i>Checkout Seguro
        </h1>

        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s <= step ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                {s < step ? <i className="fas fa-check"></i> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 rounded ${s < step ? 'bg-green-600' : 'bg-gray-700'}`} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4"><i className="fas fa-box mr-2"></i>Resumo do Pedido</h2>
            
            <div className="space-y-3 mb-6">
              {items.map(item => (
                <div key={item.product.id} className="flex items-center justify-between py-2 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.product.image}</span>
                    <div>
                      <p className="text-white">{item.product.name}</p>
                      <p className="text-gray-400 text-sm">Qtd: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-green-400 font-medium">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <h3 className="text-white text-sm font-medium mb-2"><i className="fas fa-truck mr-2"></i>Endereço de Entrega</h3>
              <p className="text-gray-300 text-sm">
                {user.address.street}, {user.address.number} {user.address.complement && `- ${user.address.complement}`}<br/>
                {user.address.neighborhood} - {user.address.city}/{user.address.state}<br/>
                CEP: {user.address.cep}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-600 pt-4">
              <span className="text-white font-bold text-lg">Total</span>
              <span className="text-green-400 font-bold text-2xl">R$ {total.toFixed(2)}</span>
            </div>

            <button onClick={() => setStep(2)} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition">
              <i className="fas fa-credit-card mr-2"></i>Ir para Pagamento
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handlePayment} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4"><i className="fas fa-credit-card mr-2"></i>Dados do Cartão</h2>
            
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
                <i className="fas fa-exclamation-triangle mr-2"></i>{error}
              </div>
            )}

            <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-300"><i className="fas fa-shield-alt mr-1"></i> Os dados do cartão são criptografados com AES-256 antes do processamento.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Número do Cartão</label>
                <input type="text" value={cardNumber} onChange={e => setCardNumber(formatCreditCard(e.target.value))} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0000 0000 0000 0000" maxLength={19} />
                {cardNumber && <p className="text-xs text-gray-400 mt-1">{getCardBrand(cardNumber)} • {maskCreditCard(cardNumber)}</p>}
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Nome no Cartão</label>
                <input type="text" value={cardHolder} onChange={e => setCardHolder(e.target.value.toUpperCase())} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="NOME COMO NO CARTÃO" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Validade</label>
                  <input type="text" value={cardExpiry} onChange={e => {
                    let v = e.target.value.replace(/\D/g, '');
                    if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
                    setCardExpiry(v);
                  }} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="MM/AA" maxLength={5} />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">CVV</label>
                  <input type="password" value={cardCVV} onChange={e => setCardCVV(e.target.value.replace(/\D/g, ''))} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="•••" maxLength={4} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg transition">
                <i className="fas fa-arrow-left mr-2"></i>Voltar
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white py-3 rounded-lg font-medium transition">
                {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Processando...</> : <><i className="fas fa-lock mr-2"></i>Pagar R$ {total.toFixed(2)}</>}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="bg-gray-800 rounded-xl border border-green-700 p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">Pedido Confirmado!</h2>
            <p className="text-gray-300 mb-4">Seu pedido foi processado com sucesso.</p>
            
            <div className="bg-gray-700 rounded-lg p-4 mb-6 inline-block">
              <p className="text-gray-400 text-sm">Código do Pedido</p>
              <p className="text-white font-mono text-xl font-bold">{orderId}</p>
            </div>

            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-blue-300 font-medium mb-2"><i className="fas fa-truck mr-2"></i>Previsão de Entrega</h3>
              <p className="text-gray-300 text-sm">
                {items.length > 0 ? `${Math.max(...items.map(i => i.product.deliveryDays))} dias úteis` : '3-5 dias úteis'}
              </p>
              <p className="text-gray-400 text-xs mt-2">
                <i className="fas fa-map-marker-alt mr-1"></i>
                {user.address.street}, {user.address.number} - {user.address.city}/{user.address.state}
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate('/orders')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition">
                <i className="fas fa-box mr-2"></i>Meus Pedidos
              </button>
              <button onClick={() => navigate('/products')} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg transition">
                <i className="fas fa-store mr-2"></i>Continuar Comprando
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
