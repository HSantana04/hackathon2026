import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  DollarSign,
  Activity,
  UserMinus,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  MoreHorizontal,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';
import { useAuthRole } from '../hooks/useAuthRole';
import { formatCurrency } from '../utils/formatCurrency';
import { AddClientModal } from '../components/AddClientModal';

type ClientRow = Database['public']['Tables']['clients']['Row'];
type PositionRow = Database['public']['Tables']['positions']['Row'];

interface DashboardClient {
  id: string;
  name: string;
  email: string;
  portfolioValue: number;
  status: 'Ativo' | 'Inativo';
  lastUpdate: string;
  avatar: string;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const ConsultantDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, role, consultantCpf, consultantProfile, allowedClientIds, refresh } =
    useAuthRole();

  const [clients, setClients] = useState<DashboardClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [totalAum, setTotalAum] = useState(0);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (role === 'cliente') {
      navigate('/client-dashboard', { replace: true });
      return;
    }

    if (role !== 'consultor' || !consultantCpf) {
      setLoading(false);
      setClients([]);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const { data: clientsData } = await supabase
          .from('clients')
          .select('*')
          .eq('cpf_consultor', consultantCpf)
          .order('created_at', { ascending: false })
          .returns<ClientRow[]>();

        const list = clientsData ?? [];

        let aum = 0;
        const enriched: DashboardClient[] = await Promise.all(
          list.map(async (c) => {
            const { data: positions } = await supabase
              .from('positions')
              .select('amount, date')
              .eq('client_id', c.id)
              .returns<Pick<PositionRow, 'amount' | 'date'>[]>();

            const portfolioValue =
              positions?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
            aum += portfolioValue;

            const lastDate = positions?.length
              ? positions.reduce((max, p) => {
                  const d = p.date ? new Date(p.date).getTime() : 0;
                  return d > max ? d : max;
                }, 0)
              : 0;

            const status: 'Ativo' | 'Inativo' =
              portfolioValue > 0 || (positions?.length ?? 0) > 0 ? 'Ativo' : 'Inativo';

            return {
              id: c.id,
              name: c.name,
              email: c.email,
              portfolioValue,
              status,
              lastUpdate:
                lastDate > 0
                  ? new Date(lastDate).toLocaleDateString('pt-BR')
                  : new Date(c.created_at).toLocaleDateString('pt-BR'),
              avatar: initials(c.name),
            };
          })
        );

        setTotalAum(aum);
        setClients(enriched);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [authLoading, user, role, consultantCpf, navigate, reloadKey]);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'Todos' || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  const summaryStats = useMemo(() => {
    const active = clients.filter((c) => c.status === 'Ativo').length;
    const inactive = clients.filter((c) => c.status === 'Inativo').length;
    return [
      {
        title: 'Patrimônio sob Gestão',
        value: totalAum,
        icon: DollarSign,
        trend: '+—',
        color: 'text-blue-600',
        bg: 'bg-blue-100',
        format: 'currency' as const,
      },
      {
        title: 'Total de Clientes',
        value: clients.length,
        icon: Users,
        trend: `${clients.length}`,
        color: 'text-cyan-600',
        bg: 'bg-cyan-100',
        format: 'number' as const,
      },
      {
        title: 'Clientes Ativos',
        value: active,
        icon: Activity,
        trend: `${active}`,
        color: 'text-emerald-600',
        bg: 'bg-emerald-100',
        format: 'number' as const,
      },
      {
        title: 'Clientes Inativos',
        value: inactive,
        icon: UserMinus,
        trend: `${inactive}`,
        color: 'text-orange-600',
        bg: 'bg-orange-100',
        format: 'number' as const,
      },
    ];
  }, [clients, totalAum]);

  const handleClientClick = (clientId: string) => {
    navigate(`/client/${clientId}`);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (role !== 'consultor') {
    return null;
  }

  const displayName = consultantProfile?.name ?? 'Consultor';

  return (
    <div className="space-y-8 pb-8 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Visão geral</h1>
            <p className="mt-1 text-slate-500">
              Olá, {displayName}. Acompanhe os clientes vinculados ao seu CPF ({consultantCpf}).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
          >
            <Plus className="h-5 w-5" />
            Adicionar novo cliente
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 w-full">
          {summaryStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="glass-card p-6 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full text-slate-600 bg-slate-100`}
                  >
                    {stat.trend.startsWith('+') && <ArrowUpRight className="h-3 w-3" />}
                    {stat.trend}
                  </span>
                </div>
                <h3 className="text-slate-500 text-sm font-medium">{stat.title}</h3>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {stat.format === 'currency' ? formatCurrency(stat.value) : stat.value}
                </p>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-white to-transparent opacity-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </div>
            );
          })}
        </div>

        <div className="glass-card flex flex-col w-full">
          <div className="p-6 border-b border-white/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800">Meus clientes ({allowedClientIds.length})</h2>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white/50 border border-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-xl text-sm w-full sm:w-64 transition-all"
                />
              </div>

              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 bg-white/50 border border-white/60 rounded-xl text-sm font-medium text-slate-600 hover:bg-white focus:ring-2 focus:ring-blue-500/50 transition-all"
                >
                  <Filter className="h-4 w-4" />
                  {statusFilter}
                </button>
                <div className="absolute right-0 top-[calc(100%+0.5rem)] w-40 bg-white/80 backdrop-blur-xl rounded-xl shadow-xl border border-white opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-10 overflow-hidden">
                  {['Todos', 'Ativo', 'Inativo'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50/80 hover:text-blue-700 transition-colors border-b border-white/40 last:border-b-0"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4 rounded-tl-xl font-medium">Cliente</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Patrimônio</th>
                  <th className="px-6 py-4 font-medium">Última atualização</th>
                  <th className="px-6 py-4 rounded-tr-xl font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/60">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => handleClientClick(client.id)}
                    className="group hover:bg-white/60 border-l-2 border-transparent hover:border-blue-500 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold border border-white shadow-sm flex-shrink-0">
                          {client.avatar}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {client.name}
                          </div>
                          <div className="text-sm text-slate-500">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          client.status === 'Ativo'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{formatCurrency(client.portfolioValue)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{client.lastUpdate}</td>
                    <td className="px-6 py-4 text-slate-400">
                      <button
                        type="button"
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors group-hover:text-blue-600 group-hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClientClick(client.id);
                        }}
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Nenhum cliente vinculado a este consultor ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          void refresh();
          setReloadKey((k) => k + 1);
          setIsAddModalOpen(false);
        }}
        consultantCpf={consultantCpf}
      />
    </div>
  );
};
