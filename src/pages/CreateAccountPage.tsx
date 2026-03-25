import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import logoUrl from '../assets/Logoportfelofc.png';
import { supabase } from '../lib/supabase';

type AccountType = 'consultor' | 'cliente';

function onlyDigits(input: string) {
  return input.replace(/\D/g, '').slice(0, 11);
}

function formatCpfForTyping(input: string) {
  const digits = onlyDigits(input);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export const CreateAccountPage = () => {
  const [accountType, setAccountType] = useState<AccountType>('consultor');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');

  // Cliente também precisa do cpf_consultor conectado
  const [cpfConsultor, setCpfConsultor] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const cpfDigits = useMemo(() => onlyDigits(cpf), [cpf]);
  const cpfConsultorDigits = useMemo(() => onlyDigits(cpfConsultor), [cpfConsultor]);

  const validateCpf = (value: string) => value.length === 11;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !cpfDigits || !password || !confirmPassword) return;
    if (!validateCpf(cpfDigits)) return setError('CPF do usuário deve conter 11 dígitos.');
    if (password !== confirmPassword) return setError('As senhas não conferem.');

    if (accountType === 'cliente') {
      if (!cpfConsultorDigits) return setError('Informe o CPF do consultor conectado.');
      if (!validateCpf(cpfConsultorDigits)) return setError('CPF do consultor deve conter 11 dígitos.');

      // Evita criar um usuário no auth.users se o consultor (CPF) não existir.
      const { data: consultorRow, error: consultorLookupError } = await supabase
        .from('consultores')
        .select('cpf')
        .eq('cpf', cpfConsultorDigits)
        .maybeSingle();

      if (consultorLookupError) {
        setError(consultorLookupError.message);
        return;
      }

      if (!consultorRow) {
        setError('Consultor não encontrado para o CPF informado.');
        return;
      }
    }

    setLoading(true);
    try {
      // 1) Cria login na tabela de authentication (auth.users)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const userId = signUpData.user?.id;
      if (!userId) {
        setError('Não foi possível obter o usuário criado.');
        return;
      }

      // 2) Cria o perfil na tabela pública (consultores ou clientes)
      if (accountType === 'consultor') {
        const { error: insertError } = await supabase.from('consultores').insert({
          auth_user_id: userId,
          cpf: cpfDigits,
          name,
          email,
        });

        if (insertError) {
          setError(insertError.message);
          return;
        }
      } else {
        const { error: insertError } = await supabase.from('clients').insert({
          id: userId,
          name,
          email,
          cpf: cpfDigits,
          cpf_consultor: cpfConsultorDigits,
        });

        if (insertError) {
          setError(insertError.message);
          return;
        }
      }

      navigate(accountType === 'cliente' ? '/client-dashboard' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex flex-col">
      {/* Subtle background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-100 rounded-full opacity-30 blur-3xl" />
      </div>

      {/* Back button */}
      <div className="relative z-10 p-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>
      </div>

      {/* Sign Up Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <img src={logoUrl} alt="Consultoria Portfel" className="h-10 w-auto" />
              <span className="text-2xl font-bold text-gray-900 tracking-tight">Consultoria Portfel</span>
            </div>
            <p className="text-gray-500">Crie sua conta para continuar</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
            <form onSubmit={handleSignUp} className="space-y-5">
              {/* Account type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de conta</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('consultor')}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                      accountType === 'consultor'
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-white'
                    }`}
                  >
                    Consultor
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('cliente')}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                      accountType === 'cliente'
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-white'
                    }`}
                  >
                    Cliente
                  </button>
                </div>
              </div>

              {/* Optional error */}
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nome
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50/50 hover:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50/50 hover:bg-white"
                    required
                  />
                </div>
              </div>

              {/* CPF */}
              <div>
                <label htmlFor="signup-cpf" className="block text-sm font-medium text-gray-700 mb-1.5">
                  CPF
                </label>
                <div className="relative">
                  <input
                    id="signup-cpf"
                    type="text"
                    inputMode="numeric"
                    value={formatCpfForTyping(cpf)}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50/50 hover:bg-white"
                    required
                    maxLength={14}
                  />
                </div>
              </div>

              {/* CPF of connected consultant */}
              {accountType === 'cliente' && (
                <div>
                  <label htmlFor="signup-cpf-consultor" className="block text-sm font-medium text-gray-700 mb-1.5">
                    CPF do consultor conectado
                  </label>
                  <input
                    id="signup-cpf-consultor"
                    type="text"
                    inputMode="numeric"
                    value={formatCpfForTyping(cpfConsultor)}
                    onChange={(e) => setCpfConsultor(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50/50 hover:bg-white"
                    required
                    maxLength={14}
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
                    Senha
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50/50 hover:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirmar senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50/50 hover:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !name || !email || !cpfDigits || !password || !confirmPassword}
                className="w-full py-3 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar conta'
                )}
              </button>

              {/* Bottom helper */}
              <p className="pt-2 text-center text-sm text-gray-500">
                Já tem uma conta?{' '}
                <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Entrar
                </Link>
              </p>
            </form>
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </p>
        </div>
      </div>
    </div>
  );
};

