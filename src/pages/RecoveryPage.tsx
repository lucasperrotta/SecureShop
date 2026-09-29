import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recoverPassword } from '../utils/store';
import { checkPasswordStrength } from '../utils/security';

export default function RecoveryPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = checkPasswordStrength(newPassword);

  const handleFindAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Find user by email to get security question
    const db = JSON.parse(localStorage.getItem('secureshop_db') || '{"users":[]}');
    const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      setError('Email não encontrado em nosso sistema.');
      return;
    }
    
    setSecurityQuestion(user.securityQuestion.question);
    setStep(2);
  };

  const handleVerifyAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!securityAnswer.trim()) {
      setError('Por favor, responda a pergunta de segurança.');
      return;
    }
    setStep(3);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword.length < 8) { setError('Senha deve ter no mínimo 8 caracteres.'); return; }
    if (newPassword !== confirmPassword) { setError('Senhas não coincidem.'); return; }
    if (passwordStrength.score < 3) { setError('Senha muito fraca.'); return; }
    
    setLoading(true);
    try {
      const result = recoverPassword(email, securityAnswer, newPassword);
      if (result.success) {
        setSuccess('Senha alterada com sucesso! Redirecionando...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.message);
        setStep(2);
      }
    } catch {
      setError('Erro ao recuperar senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔑</div>
          <h1 className="text-2xl font-bold text-white">Recuperar Senha</h1>
          <p className="text-gray-400 text-sm mt-1">Processo seguro de recuperação</p>
        </div>

        <form onSubmit={step === 1 ? handleFindAccount : step === 2 ? handleVerifyAnswer : handleResetPassword} className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
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

          {step === 1 && (
            <div>
              <label className="block text-gray-300 text-sm mb-2">Email da conta</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="seu@email.com" required />
              <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition">
                <i className="fas fa-search mr-2"></i>Buscar Conta
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-300"><i className="fas fa-question-circle mr-2"></i>{securityQuestion}</p>
              </div>
              <label className="block text-gray-300 text-sm mb-2">Sua resposta</label>
              <input type="text" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Sua resposta secreta" required />
              <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition">
                <i className="fas fa-check mr-2"></i>Verificar Resposta
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="block text-gray-300 text-sm mb-2">Nova Senha</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              {newPassword && <p className="text-xs mt-1" style={{ color: passwordStrength.color === 'emerald' ? '#10b981' : passwordStrength.color }}>{passwordStrength.label}</p>}
              
              <label className="block text-gray-300 text-sm mb-2 mt-4">Confirmar Nova Senha</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              
              <button type="submit" disabled={loading} className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white py-2.5 rounded-lg transition">
                {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Alterando...</> : <><i className="fas fa-key mr-2"></i>Alterar Senha</>}
              </button>
            </div>
          )}

          <p className="text-center text-sm text-gray-400 mt-4">
            <Link to="/login" className="text-blue-400 hover:text-blue-300"><i className="fas fa-arrow-left mr-1"></i>Voltar ao login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
