import React, { useState, useMemo } from 'react';
import { getProducts, Product } from '../utils/store';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function ProductsPage() {
  const [products] = useState<Product[]>(getProducts());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [addedId, setAddedId] = useState<string | null>(null);

  const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);

  const filtered = useMemo(() => {
    let result = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !category || p.category === category;
      return matchSearch && matchCategory;
    });
    if (sortBy === 'price_asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price);
    else result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, search, category, sortBy]);

  const handleAdd = (product: Product) => {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              <i className="fas fa-store mr-3 text-blue-400"></i>Produtos
            </h1>
            <p className="text-gray-400 mt-1">{filtered.length} produtos encontrados</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produtos..." className="bg-gray-800 border border-gray-600 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)} className="bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todas categorias</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="name">Nome A-Z</option>
              <option value="price_asc">Menor Preço</option>
              <option value="price_desc">Maior Preço</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(product => (
            <div key={product.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500 transition group">
              <div className="h-40 bg-gray-700 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
                {product.image}
              </div>
              <div className="p-4">
                <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">{product.category}</span>
                <h3 className="text-white font-semibold mt-2 text-lg">{product.name}</h3>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-2xl font-bold text-green-400">R$ {product.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      <i className="fas fa-truck mr-1"></i>{product.deliveryDays} dias úteis
                    </p>
                  </div>
                  <div className="text-right">
                    {product.stock > 0 ? (
                      <span className="text-xs text-green-400"><i className="fas fa-check-circle mr-1"></i>Em estoque ({product.stock})</span>
                    ) : (
                      <span className="text-xs text-red-400"><i className="fas fa-times-circle mr-1"></i>Esgotado</span>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {isAuthenticated ? (
                    <button
                      onClick={() => handleAdd(product)}
                      disabled={product.stock === 0}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                        addedId === product.id
                          ? 'bg-green-600 text-white'
                          : product.stock === 0
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {addedId === product.id ? (
                        <><i className="fas fa-check mr-1"></i>Adicionado!</>
                      ) : (
                        <><i className="fas fa-cart-plus mr-1"></i>Adicionar</>
                      )}
                    </button>
                  ) : (
                    <Link to="/login" className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white text-center transition">
                      <i className="fas fa-sign-in-alt mr-1"></i>Entrar para comprar
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-400 text-lg">Nenhum produto encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
