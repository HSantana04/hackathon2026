import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Plus, Trash2, Car, Home, GraduationCap, Plane, Briefcase, Gem, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';
import { useAuthRole } from '../hooks/useAuthRole';
import { useClientAccess } from '../hooks/useClientAccess';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../utils/formatCurrency';

type GoalRow = Database['public']['Tables']['goals']['Row'];
type ClientRow = Database['public']['Tables']['clients']['Row'];

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof Car; color: string }> = {
  carro: { label: 'Carro', icon: Car, color: '#3B82F6' },
  casa: { label: 'Casa', icon: Home, color: '#10B981' },
  educacao: { label: 'Educação', icon: GraduationCap, color: '#8B5CF6' },
  viagem: { label: 'Viagem', icon: Plane, color: '#F59E0B' },
  negocios: { label: 'Negócios', icon: Briefcase, color: '#EF4444' },
  patrimonio: { label: 'Patrimônio', icon: Gem, color: '#EC4899' },
  outros: { label: 'Outros', icon: Target, color: '#6B7280' },
};

function calculateMonthsToGoal(
  current: number,
  target: number,
  monthly: number,
  annualReturn: number
): number | null {
  if (current >= target) return 0;
  if (monthly <= 0 && annualReturn <= 0) return null;

  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  let balance = current;
  let months = 0;
  const maxMonths = 1200; // 100 years cap

  while (balance < target && months < maxMonths) {
    balance = balance * (1 + monthlyRate) + monthly;
    months++;
  }

  return months >= maxMonths ? null : months;
}

function formatProjection(months: number | null): string {
  if (months === null) return 'Não atingível';
  if (months === 0) return 'Meta atingida!';
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} mês(es)`;
  if (rem === 0) return `${years} ano(s)`;
  return `${years} ano(s) e ${rem} mês(es)`;
}

function formatProjectionDate(months: number | null): string {
  if (months === null || months === 0) return '';
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

interface GoalFormData {
  title: string;
  description: string;
  target_amount: string;
  current_amount: string;
  monthly_contribution: string;
  expected_annual_return: string;
  category: string;
}

const emptyForm: GoalFormData = {
  title: '',
  description: '',
  target_amount: '',
  current_amount: '',
  monthly_contribution: '',
  expected_annual_return: '10',
  category: 'outros',
};

export const Goals = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuthRole();
  const { allowed, checking: accessChecking } = useClientAccess(id);
  const [clientName, setClientName] = useState('');
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GoalFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!id || !allowed) return;
    setLoading(true);
    setError(null);
    try {
      const { data: client } = await supabase
        .from('clients')
        .select('name')
        .eq('id', id)
        .maybeSingle() as { data: Pick<ClientRow, 'name'> | null };
      if (client) setClientName(client.name);

      const { data, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false })
        .returns<GoalRow[]>();

      if (goalsError) {
        console.error('Error loading goals:', goalsError);
        if (goalsError.message.includes('relation') || goalsError.code === '42P01') {
          setError('A tabela "goals" ainda não existe. Execute a migration 20260325130000_create_goals_table.sql no Supabase.');
        } else {
          setError(goalsError.message);
        }
        setGoals([]);
      } else {
        setGoals(data || []);
      }
    } catch (err) {
      console.error('Error loading goals:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar metas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id || accessChecking || !allowed) return;
    void loadData();
  }, [id, accessChecking, allowed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !allowed) return;
    setSaving(true);
    setError(null);
    try {
      const { error: insertError } = await supabase.from('goals').insert([{
        client_id: id,
        title: form.title,
        description: form.description || null,
        target_amount: Number(form.target_amount),
        current_amount: Number(form.current_amount) || 0,
        monthly_contribution: Number(form.monthly_contribution) || 0,
        expected_annual_return: Number(form.expected_annual_return) || 10,
        category: form.category,
      }]);
      if (insertError) {
        setError(insertError.message);
        return;
      }
      setForm(emptyForm);
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error('Error saving goal:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar meta.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (goalId: string) => {
    try {
      await supabase.from('goals').delete().eq('id', goalId);
      await loadData();
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };

  if (accessChecking || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="space-y-4 text-center py-12">
        <p className="text-slate-600">Você não tem permissão para ver as metas deste cliente.</p>
        <Button onClick={() => navigate(role === 'cliente' ? '/client-dashboard' : '/clients')}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(`/client/${id}`)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para {clientName || 'detalhes'}
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="h-6 w-6 text-indigo-600" />
            Metas — {clientName}
          </h1>
          <p className="text-slate-500 mt-1">
            {role === 'cliente'
              ? 'Seus objetivos financeiros'
              : 'Objetivos financeiros do cliente'}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {/* Add Goal Form */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Nova Meta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Comprar carro novo"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição (opcional)</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detalhes da meta..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-sm"
                >
                  {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => (
                    <option key={key} value={key}>{conf.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor da Meta (R$)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.target_amount}
                  onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                  placeholder="100000"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor Atual (R$)</label>
                <input
                  type="number"
                  min={0}
                  value={form.current_amount}
                  onChange={(e) => setForm({ ...form, current_amount: e.target.value })}
                  placeholder="60000"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Aporte Mensal (R$)</label>
                <input
                  type="number"
                  min={0}
                  value={form.monthly_contribution}
                  onChange={(e) => setForm({ ...form, monthly_contribution: e.target.value })}
                  placeholder="1000"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rendimento Anual Esperado (%)</label>
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  value={form.expected_annual_return}
                  onChange={(e) => setForm({ ...form, expected_annual_return: e.target.value })}
                  placeholder="10"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-sm"
                />
              </div>
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setForm(emptyForm); }}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Criar Meta'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700">Nenhuma meta cadastrada</h3>
            <p className="text-slate-500 text-sm mt-1">Crie a primeira meta para o cliente.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const percent = Math.min(100, (Number(goal.current_amount) / Number(goal.target_amount)) * 100);
            const months = calculateMonthsToGoal(
              Number(goal.current_amount),
              Number(goal.target_amount),
              Number(goal.monthly_contribution),
              Number(goal.expected_annual_return)
            );
            const cat = CATEGORY_CONFIG[goal.category] || CATEGORY_CONFIG.outros;
            const Icon = cat.icon;

            const chartData = [
              { name: 'Atual', value: percent },
              { name: 'Restante', value: 100 - percent },
            ];

            return (
              <Card key={goal.id} className="overflow-hidden">
                <div className="flex items-start p-6 gap-5">
                  {/* Donut chart */}
                  <div className="relative shrink-0" style={{ width: 100, height: 100 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={32}
                          outerRadius={45}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          <Cell fill={cat.color} />
                          <Cell fill="#E2E8F0" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-slate-800">{percent.toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        <Icon className="h-3 w-3" />
                        {cat.label}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 truncate">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-sm text-slate-500 truncate">{goal.description}</p>
                    )}

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>{formatCurrency(Number(goal.current_amount))}</span>
                        <span>{formatCurrency(Number(goal.target_amount))}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>

                    {/* Projection */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-xs text-slate-500">Aporte mensal</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {formatCurrency(Number(goal.monthly_contribution))}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-xs text-slate-500">Rentab. anual</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {Number(goal.expected_annual_return).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 bg-indigo-50 rounded-lg p-2">
                      <p className="text-xs text-indigo-600 font-medium">Projeção de conquista</p>
                      <p className="text-sm font-bold text-indigo-800">
                        {formatProjection(months)}
                        {months !== null && months > 0 && (
                          <span className="font-normal text-indigo-500 ml-1">
                            ({formatProjectionDate(months)})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Excluir meta"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
