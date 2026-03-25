import { useEffect, useState } from 'react';
import { Users, Building2, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type PositionRow = Database['public']['Tables']['positions']['Row'];
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { generateSamplePortfolio } from '../services/sampleData';
import { formatCurrency } from '../utils/formatCurrency';

interface DashboardStats {
  totalValue: number;
  clientCount: number;
  institutionCount: number;
  assetTypeData: { name: string; value: number }[];
  institutionData: { name: string; value: number }[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalValue: 0,
    clientCount: 0,
    institutionCount: 0,
    assetTypeData: [],
    institutionData: [],
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data: positions } = await supabase
        .from('positions')
        .select('*')
        .returns<PositionRow[]>();

      const { data: clients } = await supabase
        .from('clients')
        .select('id');

      if (!positions || !clients) return;

      const totalValue = positions.reduce((sum, p) => sum + Number(p.amount), 0);

      const institutionsSet = new Set(positions.map(p => p.institution));

      const assetTypeMap = new Map<string, number>();
      positions.forEach(p => {
        const current = assetTypeMap.get(p.asset_type) || 0;
        assetTypeMap.set(p.asset_type, current + Number(p.amount));
      });

      const institutionMap = new Map<string, number>();
      positions.forEach(p => {
        const current = institutionMap.get(p.institution) || 0;
        institutionMap.set(p.institution, current + Number(p.amount));
      });

      const assetTypeData = Array.from(assetTypeMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const institutionData = Array.from(institutionMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      setStats({
        totalValue,
        clientCount: clients.length,
        institutionCount: institutionsSet.size,
        assetTypeData,
        institutionData,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleGenerateSample = async () => {
    setGenerating(true);
    await generateSamplePortfolio();
    await loadDashboardData();
    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Consolidated view of all client portfolios</p>
        </div>
        <Button onClick={handleGenerateSample} disabled={generating}>
          {generating ? 'Generating...' : 'Generate Sample Portfolio'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Portfolio Value"
          value={formatCurrency(stats.totalValue)}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <StatCard
          title="Active Clients"
          value={stats.clientCount}
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Institutions"
          value={stats.institutionCount}
          icon={<Building2 className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio by Asset Type</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.assetTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.assetTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.assetTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio by Institution</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.institutionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.institutionData}>
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
