import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addProduct } from '../utils/store';
import { sanitizeInput } from '../utils/security';
import { useNavigate } from 'react-router-dom';

export default function SellPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'Eletrônicos', stock: '', deliveryDays: '5',
  });

  if (!user) { navigate('/login'); return null; }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const emojis: Record<string, string> = {
    'Eletrônicos': '💻', 'Acessórios': '🎧', 'Periféricos': '⌨️', 'Móveis': '🪑', 'Roupas': '👕', 'Outros': '📦'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim()) { setError('Nome do produto é obrigatório.'); return; }
    if (!form.description.trim()) { setError('Descrição é obrigatória.'); return; }
    if (!form.price || parseFloat(form.price) <= 0) { setError('Preço inválido.'); return; }
    if (!form.stock || parseInt(form.stock) < 0) { setError('Estoque inválido.'); return; }

    setLoading(true);
    try {
      addProduct({
        name: sanitizeInput(form.name),
        description: sanitizeInput(form.description),
        price: parseFloat(form.price),
        image: emojis[form.category] || '📦',
        category: form.category,
        stock: parseInt(form.stock),
        sellerId: user.id,
        sellerName: user.name,
        deliveryDays: parseInt(form.deliveryDays),
      });
      setSuccess('Produto cadastrado com sucesso!');
      setForm({ name: '', description: '', price: '', category: 'Eletrônicos', stock: '', deliveryDays: '5' });
    } catch {
      setError('Erro ao cadastrar produto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          <i className="fas fa-tag mr-3 text-yellow-400"></i>Vender Produto
        </h1>
        <p className="text-gray-400 mb-8">Cadastre um novo produto para venda na plataforma.</p>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
              <i className="fas fa-exclamation-triangle mr-2"></i>{error}
            </div>
          )}
          {success && (
            <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-4 text-sm">
              <i className="fas fa-check-circle mr-2"></i>{success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Nome do Produto *</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Notebook Gamer" />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Descrição *</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Descreva seu produto..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Preço (R$) *</label>
                <input type="number" step="0.01" min="0" value={form.price} onChange={e => update('price', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Estoque *</label>
                <input type="number" min="0" value={form.stock} onChange={e => update('stock', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Categoria</label>
                <select value={form.category} onChange={e => update('category', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.keys(emojis).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Prazo de Entrega (dias)</label>
                <input type="number" min="1" max="30" value={form.deliveryDays} onChange={e => update('deliveryDays', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full mt-6 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white py-3 rounded-lg font-medium transition">
            {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Cadastrando...</> : <><i className="fas fa-plus mr-2"></i>Cadastrar Produto</>}
          </button>
        </form>
      </div>
    </div>
  );
}
