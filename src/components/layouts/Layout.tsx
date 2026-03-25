import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Database,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  Upload,
  Target,
} from 'lucide-react';
import logoUrl from '../../assets/Logoportfelofc.png';
import { supabase } from '../../lib/supabase';
import { useAuthRole } from '../../hooks/useAuthRole';

interface LayoutProps {
  children: ReactNode;
}

function displayInitials(name: string | undefined, email: string | undefined) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return '—';
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading, role, consultantProfile, clientProfile } = useAuthRole();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const navItems = useMemo(() => {
    if (role === 'cliente' && user) {
      return [
        { path: '/client-dashboard', label: 'Meu painel', icon: LayoutDashboard },
        { path: `/client/${user.id}/goals`, label: 'Metas', icon: Target },
        { path: '/upload', label: 'Inserir dados', icon: Upload },
        { path: '/review', label: 'Revisões', icon: FileCheck },
        { path: '/b3-assets', label: 'Ativos B3', icon: Database },
      ];
    }

    if (role === 'consultor') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/clients', label: 'Clientes', icon: Users },
        { path: '/upload', label: 'Inserir dados', icon: Upload },
        { path: '/review', label: 'Revisões', icon: FileCheck },
        { path: '/b3-assets', label: 'Ativos B3', icon: Database },
      ];
    }

    return [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }];
  }, [role, user]);

  const displayName =
    role === 'consultor'
      ? consultantProfile?.name ?? user?.email ?? 'Consultor'
      : role === 'cliente'
        ? clientProfile?.name ?? user?.email ?? 'Cliente'
        : user?.email ?? 'Usuário';

  const roleLabel = role === 'consultor' ? 'Consultor' : role === 'cliente' ? 'Cliente' : '';

  const avatar = displayInitials(
    role === 'consultor' ? consultantProfile?.name : clientProfile?.name,
    user?.email ?? undefined
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const searchPlaceholder =
    role === 'consultor' ? 'Buscar clientes, ações...' : 'Buscar no painel...';

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans">
      <aside className="hidden md:flex flex-col w-64 glass-card border-r border-white/60 m-4 p-4 sticky top-4 h-[calc(100vh-2rem)] z-20">
        <div className="flex items-center gap-3 px-2 mb-10 mt-2">
          <img src={logoUrl} alt="Consultoria Portfel" className="h-8 w-auto" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
            Portfel
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={`${item.path}-${item.label}`}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 shadow-md shadow-blue-500/20 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-100' : 'text-slate-400 group-hover:text-blue-600'}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-200/60">
          <div className="flex items-center justify-between px-2 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                {avatar}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-800 truncate">{displayName}</span>
                <span className="text-xs text-slate-500">{roleLabel}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors group"
          >
            <LogOut className="h-5 w-5 text-slate-400 group-hover:text-red-500 transition-colors" />
            <span className="font-medium text-sm">Sair da conta</span>
          </button>
        </div>
      </aside>

      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 z-30 sticky top-0">
        <div className="flex items-center gap-2">
          <img src={logoUrl} alt="Consultoria Portfel" className="h-7 w-auto" />
          <span className="text-lg font-bold text-slate-900">Portfel</span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600 rounded-lg hover:bg-slate-100"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-white pt-20 px-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={`m-${item.path}-${item.label}`}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 mt-4"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sair da conta</span>
            </button>
          </nav>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 bg-gradient-premium relative overflow-hidden">
        <header className="hidden md:flex items-center justify-between h-20 px-8 sticky top-0 z-10 glass shadow-sm m-4 rounded-xl border border-white">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 rounded-full glass-card border border-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2.5 rounded-full glass-card hover:bg-white text-slate-600 transition-colors border border-white"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-orange-500 border-2 border-white" />
              </button>

              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} aria-hidden />
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800 text-sm">Notificações</h3>
                    </div>
                    <div className="px-4 py-6 text-sm text-slate-500 text-center">Sem notificações novas</div>
                  </div>
                </>
              )}
            </div>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-slate-800">
                {new Date().toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
              </span>
              <span className="text-xs text-slate-500">{roleLabel || 'Conectado'}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 pt-2">
          <div className="max-w-7xl mx-auto animate-fade-in w-full">{children}</div>
        </div>
      </main>
    </div>
  );
};
