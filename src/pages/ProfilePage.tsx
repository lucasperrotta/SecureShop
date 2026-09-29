import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { decryptData, logAudit, getAuditLogs } from '../utils/security';
import { formatCPF, formatPhone, maskCPF, maskPhone, maskCreditCard } from '../utils/validators';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showSensitive, setShowSensitive] = useState(false);
  const [activeTab, setActiveTab] = useState('data');
  const [auditLogs] = useState(() => getAuditLogs().slice(-20).reverse());

  if (!user) { navigate('/login'); return null; }

  const decryptedCPF = showSensitive ? (() => { try { return formatCPF(decryptData(user.cpf)); } catch { return '***'; } })() : maskCPF(user.cpf);
  const decryptedPhone = showSensitive ? (() => { try { return formatPhone(decryptData(user.phone)); } catch { return '***'; } })() : maskPhone(user.phone);

  const toggleSensitive = () => {
    setShowSensitive(!showSensitive);
    logAudit('SENSITIVE_DATA_VIEW', user.id, showSensitive ? 'Dados ocultos' : 'Dados sensíveis exibidos', showSensitive ? 'info' : 'warning');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            <i className="fas fa-user-shield mr-3 text-blue-400"></i>Meu Perfil
          </h1>
          <button onClick={toggleSensitive} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${showSensitive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
            <i className={`fas ${showSensitive ? 'fa-eye-slash' : 'fa-eye'} mr-2`}></i>
            {showSensitive ? 'Ocultar Dados' : 'Mostrar Dados'}
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'data', label: 'Dados Pessoais', icon: 'fa-user' },
            { id: 'security', label: 'Segurança', icon: 'fa-shield-alt' },
            { id: 'audit', label: 'Audit Log', icon: 'fa-clipboard-list' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
              <i className={`fas ${tab.icon} mr-2`}></i>{tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'data' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4"><i className="fas fa-id-card mr-2 text-blue-400"></i>Informações Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Nome</p>
                  <p className="text-white">{user.name}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <p className="text-white">{user.email}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">CPF</p>
                  <p className="text-white font-mono">{decryptedCPF}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Telefone</p>
                  <p className="text-white font-mono">{decryptedPhone}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4"><i className="fas fa-home mr-2 text-green-400"></i>Endereço</h2>
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-white">{user.address.street}, {user.address.number} {user.address.complement && `- ${user.address.complement}`}</p>
                <p className="text-gray-300">{user.address.neighborhood} - {user.address.city}/{user.address.state}</p>
                <p className="text-gray-400">CEP: {user.address.cep}</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4"><i className="fas fa-credit-card mr-2 text-purple-400"></i>Cartões de Crédito</h2>
              {user.creditCards.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhum cartão cadastrado.</p>
              ) : (
                <div className="space-y-3">
                  {user.creditCards.map(card => (
                    <div key={card.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="text-white font-mono">{showSensitive ? (() => { try { return maskCreditCard(decryptData(card.number)); } catch { return '••••'; } })() : maskCreditCard('0000000000000000')}</p>
                        <p className="text-gray-400 text-sm">{card.holder} • {card.brand}</p>
                      </div>
                      <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">**** {card.expiry}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4"><i className="fas fa-shield-alt mr-2 text-green-400"></i>Status de Segurança</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                  <span className="text-gray-300"><i className="fas fa-key mr-2"></i>Senha (Hash PBKDF2)</span>
                  <span className="text-green-400 text-sm"><i className="fas fa-check-circle mr-1"></i>Protegida</span>
                </div>
                <div className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                  <span className="text-gray-300"><i className="fas fa-lock mr-2"></i>Criptografia (AES-256)</span>
                  <span className="text-green-400 text-sm"><i className="fas fa-check-circle mr-1"></i>Ativa</span>
                </div>
                <div className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                  <span className="text-gray-300"><i className="fas fa-mobile-alt mr-2"></i>Autenticação 2FA</span>
                  <span className={user.twoFactorEnabled ? 'text-green-400 text-sm' : 'text-yellow-400 text-sm'}>
                    <i className={`fas ${user.twoFactorEnabled ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-1`}></i>
                    {user.twoFactorEnabled ? 'Ativada' : 'Desativada'}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                  <span className="text-gray-300"><i className="fas fa-clock mr-2"></i>Session Timeout</span>
                  <span className="text-green-400 text-sm"><i className="fas fa-check-circle mr-1"></i>30 minutos</span>
                </div>
                <div className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                  <span className="text-gray-300"><i className="fas fa-ban mr-2"></i>Rate Limiting</span>
                  <span className="text-green-400 text-sm"><i className="fas fa-check-circle mr-1"></i>5 tentativas/5min</span>
                </div>
                <div className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                  <span className="text-gray-300"><i className="fas fa-exchange-alt mr-2"></i>CSRF Protection</span>
                  <span className="text-green-400 text-sm"><i className="fas fa-check-circle mr-1"></i>Token ativo</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4"><i className="fas fa-info-circle mr-2 text-blue-400"></i>Informações da Conta</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Conta criada em</p>
                  <p className="text-white text-sm">{new Date(user.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Último login</p>
                  <p className="text-white text-sm">{user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'N/A'}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Tentativas falhas</p>
                  <p className="text-white text-sm">{user.failedAttempts}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Status</p>
                  <p className={`text-sm ${user.locked ? 'text-red-400' : 'text-green-400'}`}>{user.locked ? 'Bloqueada' : 'Ativa'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4"><i className="fas fa-clipboard-list mr-2 text-yellow-400"></i>Log de Auditoria (Últimas 20 ações)</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {auditLogs.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhum registro encontrado.</p>
              ) : (
                auditLogs.map((log, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${log.severity === 'critical' ? 'bg-red-900/30 border border-red-800' : log.severity === 'warning' ? 'bg-yellow-900/20 border border-yellow-800/50' : 'bg-gray-700'}`}>
                    <span className={`mt-0.5 ${log.severity === 'critical' ? 'text-red-400' : log.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'}`}>
                      <i className={`fas ${log.severity === 'critical' ? 'fa-exclamation-circle' : log.severity === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}`}></i>
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{log.action}</p>
                      {log.details && <p className="text-gray-400 text-xs">{log.details}</p>}
                    </div>
                    <span className="text-gray-500 text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
