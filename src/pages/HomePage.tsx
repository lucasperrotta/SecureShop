import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-gray-900 to-purple-900/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-5xl font-bold text-white mb-4">
            SecureShop
          </h1>
          <p className="text-xl text-gray-300 mb-2">Sistema de Comércio Eletrônico com Segurança Avançada</p>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Compre e venda produtos com a máxima proteção dos seus dados. 
            Criptografia AES-256, autenticação multi-fator, e conformidade com as melhores práticas OWASP.
          </p>
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition text-lg">
                <i className="fas fa-store mr-2"></i>Ver Produtos
              </Link>
            ) : (
              <>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition text-lg">
                  <i className="fas fa-user-plus mr-2"></i>Criar Conta
                </Link>
                <Link to="/login" className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium transition text-lg">
                  <i className="fas fa-sign-in-alt mr-2"></i>Entrar
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          <i className="fas fa-shield-alt mr-3 text-green-400"></i>Segurança de Nível Empresarial
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: 'fa-lock', color: 'text-blue-400', title: 'Criptografia AES-256', desc: 'Todos os dados sensíveis (CPF, cartão, telefone) são criptografados antes do armazenamento.' },
            { icon: 'fa-key', color: 'text-purple-400', title: 'Hash PBKDF2', desc: 'Senhas hasheadas com PBKDF2 e 10.000 iterações, impossibilitando engenharia reversa.' },
            { icon: 'fa-mobile-alt', color: 'text-green-400', title: 'Autenticação 2FA', desc: 'Autenticação de dois fatores com TOTP para camada extra de segurança.' },
            { icon: 'fa-ban', color: 'text-red-400', title: 'Rate Limiting', desc: 'Proteção contra brute-force com bloqueio automático após 5 tentativas falhas.' },
            { icon: 'fa-exchange-alt', color: 'text-yellow-400', title: 'CSRF Protection', desc: 'Tokens CSRF únicos por sessão previnem ataques de falsificação de requisições.' },
            { icon: 'fa-clock', color: 'text-cyan-400', title: 'Session Timeout', desc: 'Sessões expiram automaticamente após 30 minutos de inatividade.' },
            { icon: 'fa-clipboard-list', color: 'text-orange-400', title: 'Audit Logging', desc: 'Todas as ações são registradas em log de auditoria para rastreabilidade.' },
            { icon: 'fa-filter', color: 'text-pink-400', title: 'Input Sanitization', desc: 'Validação e sanitização de todos os inputs previnem XSS e injection attacks.' },
            { icon: 'fa-eye-slash', color: 'text-indigo-400', title: 'Data Masking', desc: 'Dados sensíveis são mascarados na interface, exibidos apenas sob demanda.' },
          ].map((feature, i) => (
            <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-500 transition">
              <div className={`text-3xl ${feature.color} mb-3`}>
                <i className={`fas ${feature.icon}`}></i>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OWASP Compliance */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            <i className="fas fa-check-double mr-2 text-green-400"></i>Conformidade OWASP Top 10
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'A01', name: 'Broken Access Control', status: 'Mitigado', desc: 'Rotas protegidas, verificação de sessão' },
              { id: 'A02', name: 'Cryptographic Failures', status: 'Mitigado', desc: 'AES-256, PBKDF2, TLS headers' },
              { id: 'A03', name: 'Injection', status: 'Mitigado', desc: 'Sanitização de inputs, React escaping' },
              { id: 'A04', name: 'Insecure Design', status: 'Mitigado', desc: 'Arquitetura segura por design' },
              { id: 'A05', name: 'Security Misconfiguration', status: 'Mitigado', desc: 'Headers de segurança configurados' },
              { id: 'A06', name: 'Vulnerable Components', status: 'Monitorado', desc: 'Dependências atualizadas' },
              { id: 'A07', name: 'Auth Failures', status: 'Mitigado', desc: 'Rate limiting, account lockout, 2FA' },
              { id: 'A08', name: 'Data Integrity Failures', status: 'Mitigado', desc: 'CSRF tokens, validação de dados' },
              { id: 'A09', name: 'Logging Failures', status: 'Mitigado', desc: 'Audit logs completos' },
              { id: 'A10', name: 'SSRF', status: 'Mitigado', desc: 'Validação de URLs e origens' },
            ].map(item => (
              <div key={item.id} className="flex items-start gap-3 bg-gray-700 rounded-lg p-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.status === 'Mitigado' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                  {item.id}
                </span>
                <div>
                  <p className="text-white text-sm font-medium">{item.name}</p>
                  <p className="text-gray-400 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            🔒 SecureShop © 2024 — Sistema desenvolvido com foco em segurança da informação
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Protegido com: AES-256 • PBKDF2 • CSRF Tokens • Rate Limiting • Session Management • Audit Logging
          </p>
        </div>
      </footer>
    </div>
  );
}
