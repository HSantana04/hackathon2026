import { useState, useMemo } from 'react';
import { Users, DollarSign, Activity, UserMinus, Search, Filter, Plus, ArrowUpRight, MoreHorizontal } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { AddClientModal } from '../components/AddClientModal';

// Mock Data
const SUMMARY_STATS = [
  { title: 'Patrimônio sob Gestão', value: 87348000, icon: DollarSign, trend: '+12%', color: 'text-blue-600', bg: 'bg-blue-100' },
  { title: 'Total de Clientes', value: 124, icon: Users, trend: '+3', color: 'text-cyan-600', bg: 'bg-cyan-100' },
  { title: 'Clientes Ativos', value: 118, icon: Activity, trend: '+5', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { title: 'Clientes Inativos', value: 6, icon: UserMinus, trend: '-2', color: 'text-orange-600', bg: 'bg-orange-100' },
];

const MOCK_CLIENTS = [
  { id: '1', name: 'Alfonso Albuquerque', email: 'alfonso.albuquerque@email.com', portfolioValue: 12400000, status: 'Ativo', lastUpdate: '15/08/2026', avatar: 'AA' },
  { id: '2', name: 'Beatriz Silva', email: 'beatriz.silva@email.com', portfolioValue: 8500000, status: 'Ativo', lastUpdate: '16/08/2026', avatar: 'BS' },
  { id: '3', name: 'Carlos Santos', email: 'carlos.santos@email.com', portfolioValue: 3200000, status: 'Ativo', lastUpdate: '10/08/2026', avatar: 'CS' },
  { id: '4', name: 'Daniela Costa', email: 'daniela.costa@email.com', portfolioValue: 0, status: 'Inativo', lastUpdate: '01/05/2026', avatar: 'DC' },
  { id: '5', name: 'Eduardo Oliveira', email: 'eduardo.o@email.com', portfolioValue: 15600000, status: 'Ativo', lastUpdate: '14/08/2026', avatar: 'EO' },
  { id: '6', name: 'Fernanda Lima', email: 'fernanda.lima@email.com', portfolioValue: 5400000, status: 'Ativo', lastUpdate: '12/08/2026', avatar: 'FL' },
];

export const ConsultantDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredClients = useMemo(() => {
    return MOCK_CLIENTS.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            client.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'Todos' || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const handleClientClick = (clientId: string) => {
    console.log('Navegar para detalhes do cliente:', clientId);
    // navigate(`/client/${clientId}`);
  };

  return (
    <div className="space-y-8 pb-8 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Visão Geral</h1>
            <p className="mt-1 text-slate-500">Acompanhe o desempenho da carteira geral de seus clientes.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
          >
            <Plus className="h-5 w-5" />
            Adicionar Novo Cliente
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 w-full">
          {SUMMARY_STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="glass-card p-6 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-orange-600 bg-orange-50'}`}>
                    {stat.trend.startsWith('+') && <ArrowUpRight className="h-3 w-3" />}
                    {stat.trend}
                  </span>
                </div>
                <h3 className="text-slate-500 text-sm font-medium">{stat.title}</h3>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {stat.title === 'Patrimônio sob Gestão' ? formatCurrency(stat.value) : stat.value}
                </p>
                
                {/* Decorative Background Element */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-white to-transparent opacity-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              </div>
            );
          })}
        </div>

        {/* Clients Section */}
        <div className="glass-card flex flex-col w-full">
          {/* Table Header / Filters */}
          <div className="p-6 border-b border-white/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800">Meus Clientes</h2>
            
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
                <button className="flex items-center gap-2 px-4 py-2 bg-white/50 border border-white/60 rounded-xl text-sm font-medium text-slate-600 hover:bg-white focus:ring-2 focus:ring-blue-500/50 transition-all">
                  <Filter className="h-4 w-4" />
                  {statusFilter}
                </button>
                {/* Simple dropdown for status */}
                <div className="absolute right-0 top-[calc(100%+0.5rem)] w-40 bg-white/80 backdrop-blur-xl rounded-xl shadow-xl border border-white opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-10 overflow-hidden">
                  {['Todos', 'Ativo', 'Inativo'].map(status => (
                    <button 
                      key={status}
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

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4 rounded-tl-xl font-medium">Cliente</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Patrimônio</th>
                  <th className="px-6 py-4 font-medium">Última Atualização</th>
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        client.status === 'Ativo' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {formatCurrency(client.portfolioValue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {client.lastUpdate}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors group-hover:text-blue-600 group-hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); console.log('Ações extras para', client.name); }}>
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Nenhum cliente encontrado com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <AddClientModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={() => {}} />
    </div>
  );
};
