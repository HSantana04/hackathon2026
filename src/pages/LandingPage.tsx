import { Link } from 'react-router-dom';
import { BarChart3, Upload, Users, ArrowRight, Shield, Zap, ChevronRight } from 'lucide-react';
import logoUrl from '../assets/Logoportfelofc.png';

const features = [
  {
    icon: BarChart3,
    title: 'Dashboard Consolidado',
    description: 'Visualize todos os portfólios dos seus clientes em um único painel, com gráficos interativos e métricas em tempo real.',
  },
  {
    icon: Upload,
    title: 'Extração Automática',
    description: 'Faça upload de extratos bancários em PDF e nossa IA extrai automaticamente as posições de investimento.',
  },
  {
    icon: Users,
    title: 'Gestão de Clientes',
    description: 'Gerencie toda a carteira dos seus clientes de forma organizada, com histórico completo de posições e documentos.',
  },
];

const stats = [
  { value: '99.9%', label: 'Uptime garantido' },
  { value: '10x', label: 'Mais produtividade' },
  { value: '256-bit', label: 'Criptografia' },
  { value: '24/7', label: 'Suporte dedicado' },
];

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white overflow-hidden">

      {/* Navbar */}
      <nav className="relative z-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src={logoUrl} alt="Consultoria Portfel" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">Consultoria Portfel</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Funcionalidades
              </a>
              <a href="#security" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Segurança
              </a>
              <a href="#stats" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Números
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all duration-200 flex items-center gap-2"
              >
                Login
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 sm:pt-28 sm:pb-40">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full text-sm font-medium text-blue-700 mb-8">
            <img src={logoUrl} alt="Consultoria Portfel" className="h-4 w-auto" />
            Consultoria Portfel
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1]">
            Gerencie portfólios{' '}
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              com inteligência
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            A plataforma completa para consultores de investimentos. Consolide carteiras, extraia dados automaticamente e ofereça o melhor atendimento aos seus clientes.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="group px-8 py-3.5 text-sm font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-gray-900/20"
            >
              Começar Agora
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#features"
              className="px-8 py-3.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all duration-200"
            >
              Explorar funcionalidades
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Tudo que você precisa
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Ferramentas poderosas para transformar a forma como você gerencia os investimentos dos seus clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full border border-white/20"
                  style={{
                    width: `${(i + 1) * 200}px`,
                    height: `${(i + 1) * 200}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-8">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Segurança de nível bancário
              </h2>
              <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Seus dados e os de seus clientes protegidos com criptografia AES-256, infraestrutura Supabase e conformidade com as melhores práticas do mercado.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Zap className="h-4 w-4 text-green-400" />
                  Autenticação segura
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Zap className="h-4 w-4 text-green-400" />
                  Dados criptografados
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Zap className="h-4 w-4 text-green-400" />
                  Backups automáticos
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative z-10 py-24 bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Pronto para transformar sua consultoria?
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            Comece gratuitamente e descubra como o Portfolio Hub pode elevar sua gestão de investimentos.
          </p>
          <div className="mt-8">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all duration-200 shadow-lg shadow-gray-900/20"
            >
              Começar Agora — é gratuito
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logoUrl} alt="Consultoria Portfel" className="h-6 w-auto" />
              <span className="text-sm font-semibold text-gray-900">Consultoria Portfel</span>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Consultoria Portfel. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
