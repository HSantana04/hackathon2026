import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Target, TrendingUp, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';
import { useAuthRole } from '../hooks/useAuthRole';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { formatCurrency } from '../utils/formatCurrency';

type PositionRow = Database['public']['Tables']['positions']['Row'];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, role, clientProfile } = useAuthRole();
  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user || role !== 'cliente' || !clientProfile) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('positions')
          .select('*')
          .eq('client_id', clientProfile.id)
          .order('amount', { ascending: false })
          .returns<PositionRow[]>();
        setPositions(data ?? []);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [authLoading, user, role, clientProfile]);

  useEffect(() => {
    if (authLoading || loading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (role === 'consultor') {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, loading, user, role, navigate]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!clientProfile) {
    return (
      <div className="text-center py-12 text-slate-600">
        Não foi possível carregar seu perfil de cliente.
      </div>
    );
  }

  const totalValue = positions.reduce((sum, p) => sum + Number(p.amount), 0);

  const assetTypeData = positions.reduce(
    (acc, p) => {
      const existing = acc.find((item) => item.name === p.asset_type);
      if (existing) existing.value += Number(p.amount);
      else acc.push({ name: p.asset_type, value: Number(p.amount) });
      return acc;
    },
    [] as { name: string; value: number }[]
  );

  return (
    <div className="space-y-8 pb-8">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl shadow-xl p-8 text-white">
        <p className="text-emerald-100 text-sm font-medium">Meu patrimônio</p>
        <h1 className="text-3xl font-bold mt-1">Olá, {clientProfile.name.split(' ')[0]}</h1>
        <div className="mt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-sm text-emerald-100">Total investido</p>
            <p className="text-4xl font-bold mt-1">{formatCurrency(totalValue)}</p>
            <p className="text-xs text-emerald-200 mt-2">{positions.length} posição(ões) cadastrada(s)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/15 hover:bg-white/25 text-white border-0"
              onClick={() => navigate(`/client/${clientProfile.id}/goals`)}
            >
              <Target className="h-4 w-4 mr-2" />
              Minhas metas
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/15 hover:bg-white/25 text-white border-0"
              onClick={() => navigate(`/client/${clientProfile.id}`)}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Detalhes completos
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Patrimônio</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-violet-100">
              <Wallet className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Posições</p>
              <p className="text-xl font-bold text-slate-900">{positions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-100">
              <Target className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Tipos de ativo</p>
              <p className="text-xl font-bold text-slate-900">{assetTypeData.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {assetTypeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por tipo de ativo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={assetTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Meus investimentos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ativo</TableHead>
                <TableHead>Instituição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.asset_name}</TableCell>
                  <TableCell>{p.institution}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {p.asset_type}
                    </span>
                  </TableCell>
                  <TableCell>{p.quantity}</TableCell>
                  <TableCell className="font-semibold text-green-600">{formatCurrency(Number(p.amount))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {positions.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              Nenhum investimento cadastrado ainda. Peça ao seu consultor para incluir posições ou envie um extrato em{' '}
              <button type="button" className="text-blue-600 font-medium" onClick={() => navigate('/upload')}>
                Inserir dados
              </button>
              .
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
