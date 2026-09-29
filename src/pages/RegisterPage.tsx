import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../utils/store';
import { validateCPF, validatePhone, validateEmail, validateName, formatCPF, formatPhone, formatCEP, validateCEP } from '../utils/validators';
import { checkPasswordStrength, sanitizeInput } from '../utils/security';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    cpf: '', phone: '',
    street: '', number: '', complement: '', neighborhood: '', city: '', state: '', cep: '',
    securityQuestion: 'Qual o nome do seu primeiro animal de estimação?',
    securityAnswer: '',
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const passwordStrength = checkPasswordStrength(form.password);

  const validateStep1 = () => {
    if (!validateName(form.name)) return 'Nome inválido (mínimo 3 caracteres, apenas letras).';
    if (!validateEmail(form.email)) return 'Email inválido.';
    if (form.password.length < 8) return 'Senha deve ter no mínimo 8 caracteres.';
    if (form.password !== form.confirmPassword) return 'Senhas não coincidem.';
    if (passwordStrength.score < 3) return 'Senha muito fraca. Use letras maiúsculas, minúsculas, números e símbolos.';
    return '';
  };

  const validateStep2 = () => {
    if (!validateCPF(form.cpf)) return 'CPF inválido.';
    if (!validatePhone(form.phone)) return 'Telefone inválido.';
    return '';
  };

  const validateStep3 = () => {
    if (!form.street || !form.number || !form.neighborhood || !form.city || !form.state) return 'Preencha todos os campos obrigatórios.';
    if (!validateCEP(form.cep)) return 'CEP inválido.';
    return '';
  };

  const handleNext = () => {
    setError('');
    if (step === 1) { const err = validateStep1(); if (err) { setError(err); return; } setStep(2); }
    else if (step === 2) { const err = validateStep2(); if (err) { setError(err); return; } setStep(3); }
    else if (step === 3) { const err = validateStep3(); if (err) { setError(err); return; } setStep(4); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.securityAnswer.trim()) { setError('Responda a pergunta de segurança.'); return; }

    setLoading(true);
    try {
      const result = registerUser({
        name: sanitizeInput(form.name),
        email: sanitizeInput(form.email),
        password: form.password,
        cpf: form.cpf,
        phone: form.phone,
        address: {
          street: sanitizeInput(form.street),
          number: sanitizeInput(form.number),
          complement: sanitizeInput(form.complement),
          neighborhood: sanitizeInput(form.neighborhood),
          city: sanitizeInput(form.city),
          state: form.state,
          cep: form.cep,
        },
        securityQuestion: { question: form.securityQuestion, answer: form.securityAnswer },
      });

      if (result.success) {
        navigate('/login');
      } else {
        setError(result.message);
      }
    } catch {
      setError('Erro ao cadastrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔒</div>
          <h1 className="text-2xl font-bold text-white">Criar Conta Segura</h1>
          <div className="flex items-center justify-center gap-2 mt-3">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`w-8 h-1 rounded ${s <= step ? 'bg-blue-500' : 'bg-gray-600'}`} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Passo {step} de 4</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
              <i className="fas fa-exclamation-triangle mr-2"></i>{error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold mb-4"><i className="fas fa-user mr-2"></i>Dados Pessoais</h2>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Nome Completo</label>
                <input type="text" value={form.name} onChange={e => update('name', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="João da Silva" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="joao@email.com" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Senha (mín. 8 caracteres)</label>
                <input type="password" value={form.password} onChange={e => update('password', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
                {form.password && <p className="text-xs mt-1" style={{ color: passwordStrength.color === 'emerald' ? '#10b981' : passwordStrength.color }}>{passwordStrength.label}</p>}
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Confirmar Senha</label>
                <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold mb-4"><i className="fas fa-id-card mr-2"></i>Documentos</h2>
              <div>
                <label className="block text-gray-300 text-sm mb-1">CPF</label>
                <input type="text" value={form.cpf} onChange={e => update('cpf', formatCPF(e.target.value))} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="000.000.000-00" maxLength={14} />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Telefone</label>
                <input type="text" value={form.phone} onChange={e => update('phone', formatPhone(e.target.value))} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="(00) 00000-0000" maxLength={15} />
              </div>
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                <p className="text-xs text-blue-300"><i className="fas fa-lock mr-1"></i> Seus dados são criptografados com AES-256 antes de serem armazenados.</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold mb-4"><i className="fas fa-home mr-2"></i>Endereço</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-gray-300 text-sm mb-1">Rua</label>
                  <input type="text" value={form.street} onChange={e => update('street', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Número</label>
                  <input type="text" value={form.number} onChange={e => update('number', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Complemento</label>
                <input type="text" value={form.complement} onChange={e => update('complement', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Apto, bloco..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Bairro</label>
                  <input type="text" value={form.neighborhood} onChange={e => update('neighborhood', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Cidade</label>
                  <input type="text" value={form.city} onChange={e => update('city', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Estado</label>
                  <select value={form.state} onChange={e => update('state', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Selecione</option>
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">CEP</label>
                  <input type="text" value={form.cep} onChange={e => update('cep', formatCEP(e.target.value))} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" maxLength={9} />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold mb-4"><i className="fas fa-question-circle mr-2"></i>Segurança</h2>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Pergunta de Segurança</label>
                <select value={form.securityQuestion} onChange={e => update('securityQuestion', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Qual o nome do seu primeiro animal de estimação?</option>
                  <option>Em qual cidade você nasceu?</option>
                  <option>Qual o nome da sua escola primária?</option>
                  <option>Qual o filme favorito da sua infância?</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Resposta (será usada para recuperar sua senha)</label>
                <input type="text" value={form.securityAnswer} onChange={e => update('securityAnswer', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Sua resposta secreta" />
              </div>
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-3">
                <p className="text-xs text-green-300"><i className="fas fa-check-circle mr-1"></i> A resposta será hasheada com PBKDF2 e nunca armazenada em texto plano.</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2.5 rounded-lg transition">
                <i className="fas fa-arrow-left mr-2"></i>Voltar
              </button>
            )}
            {step < 4 ? (
              <button type="button" onClick={handleNext} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition">
                Próximo<i className="fas fa-arrow-right ml-2"></i>
              </button>
            ) : (
              <button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white py-2.5 rounded-lg transition">
                {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Cadastrando...</> : <><i className="fas fa-check mr-2"></i>Criar Conta</>}
              </button>
            )}
          </div>

          <p className="text-center text-sm text-gray-400 mt-4">
            Já tem conta? <Link to="/login" className="text-blue-400 hover:text-blue-300">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
