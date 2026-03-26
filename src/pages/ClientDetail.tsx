import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Calendar, ShieldAlert, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';
import { useAuthRole } from '../hooks/useAuthRole';
import { useClientAccess } from '../hooks/useClientAccess';

type ClientRow = Database['public']['Tables']['clients']['Row'];
type PositionRow = Database['public']['Tables']['positions']['Row'];
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { formatCurrency } from '../utils/formatCurrency';
import { FgcAlert } from '../components/FgcAlert';
import { FundCarousel } from '../components/FundCarousel';

interface Client {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface Position {
  id: string;
  asset_name: string;
  institution: string;
  asset_type: string;
  amount: number;
  quantity: number;
  date: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuthRole();
  const { allowed, checking: accessChecking } = useClientAccess(id);
  const [client, setClient] = useState<Client | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFgcAlert, setShowFgcAlert] = useState(false);
  const [institutionExposures, setInstitutionExposures] = useState<{ institution: string; total: number }[]>([]);

  useEffect(() => {
    if (!id || accessChecking || !allowed) return;

    const loadClientData = async () => {
      setLoading(true);
      try {
        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .maybeSingle() as { data: ClientRow | null };

        const { data: positionsData } = await supabase
          .from('positions')
          .select('*')
          .eq('client_id', id)
          .order('amount', { ascending: false })
          .returns<PositionRow[]>();

        setClient(clientData);
        setPositions(positionsData || []);

        // Check FGC exposure
        if (positionsData && positionsData.length > 0) {
          const grouped = positionsData.reduce((acc, p) => {
            acc[p.institution] = (acc[p.institution] || 0) + Number(p.amount);
            return acc;
          }, {} as Record<string, number>);

          const exposures = Object.entries(grouped).map(([institution, total]) => ({
            institution,
            total,
          }));
          setInstitutionExposures(exposures);

          const hasUncovered = exposures.some((e) => e.total > 250_000);
          if (hasUncovered) {
            setShowFgcAlert(true);
          }
        }
      } catch (error) {
        console.error('Error loading client data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [id, accessChecking, allowed]);

  if (accessChecking || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-600">Você não tem permissão para ver este cliente.</p>
        <Button onClick={() => navigate(role === 'cliente' ? '/client-dashboard' : '/clients')}>
          Voltar
        </Button>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Client not found</p>
      </div>
    );
  }

  const totalValue = positions.reduce((sum, p) => sum + Number(p.amount), 0);

  const assetTypeData = positions.reduce((acc, p) => {
    const existing = acc.find(item => item.name === p.asset_type);
    if (existing) {
      existing.value += Number(p.amount);
    } else {
      acc.push({ name: p.asset_type, value: Number(p.amount) });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const institutionData = positions.reduce((acc, p) => {
    const existing = acc.find(item => item.name === p.institution);
    if (existing) {
      existing.value += Number(p.amount);
    } else {
      acc.push({ name: p.institution, value: Number(p.amount) });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const positionsByInstitution = positions.reduce((acc, p) => {
    if (!acc[p.institution]) acc[p.institution] = [];
    acc[p.institution].push(p);
    return acc;
  }, {} as Record<string, Position[]>);

  const institutionGroups = Object.entries(positionsByInstitution).map(([institution, institutionPositions]) => ({
    institution,
    positions: institutionPositions,
    totalAmount: institutionPositions.reduce((sum, pos) => sum + Number(pos.amount), 0),
  }));

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(role === 'cliente' ? '/client-dashboard' : '/clients')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {role === 'cliente' ? 'Voltar ao meu painel' : 'Voltar para clientes'}
      </Button>

      <div className="flex gap-6 items-stretch">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white flex-1">
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <div className="mt-4 flex items-center gap-6 text-blue-100">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{client.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Cliente desde {new Date(client.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          <div className="mt-6 flex items-end justify-between">
            <div>
              <p className="text-sm text-blue-100">Patrimônio Total</p>
              <p className="text-4xl font-bold mt-1">{formatCurrency(totalValue)}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/client/${id}/fgc`)}
                className="bg-white/10 hover:bg-white/20 text-white border-0"
              >
                <ShieldAlert className="h-4 w-4 mr-1" />
                Cobertura FGC
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/client/${id}/goals`)}
                className="bg-white/10 hover:bg-white/20 text-white border-0"
              >
                <Target className="h-4 w-4 mr-1" />
                Metas
              </Button>
            </div>
          </div>
        </div>
        <FundCarousel positions={positions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribution by Asset Type</CardTitle>
          </CardHeader>
          <CardContent>
            {assetTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
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
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No positions yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution by Institution</CardTitle>
          </CardHeader>
          <CardContent>
            {institutionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={institutionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {institutionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No positions yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Positions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell className="font-medium">{position.asset_name}</TableCell>
                  <TableCell>{position.institution}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {position.asset_type}
                    </span>
                  </TableCell>
                  <TableCell>{position.quantity}</TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {formatCurrency(Number(position.amount))}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(position.date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {positions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Nenhuma posição encontrada para este cliente
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Posições por Instituição Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          {institutionGroups.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhuma posição para agrupar por instituição
            </div>
          ) : (
            <div className="space-y-8">
              {institutionGroups.map((group) => (
                <div key={group.institution} className="border rounded-lg p-4">
                  <div className="mb-4 flex items-center justify-between bg-slate-50 px-4 py-3 rounded-md">
                    <h3 className="text-lg font-semibold text-slate-800">{group.institution}</h3>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Total Investido</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(group.totalAmount)}</p>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ativo</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.positions.map((position) => (
                        <TableRow key={position.id}>
                          <TableCell className="font-medium">{position.asset_name}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {position.asset_type}
                            </span>
                          </TableCell>
                          <TableCell>{position.quantity}</TableCell>
                          <TableCell className="font-semibold text-green-600">
                            {formatCurrency(Number(position.amount))}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {new Date(position.date).toLocaleDateString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FGC Alert */}
      {showFgcAlert && client && (
        <FgcAlert
          clientId={client.id}
          clientName={client.name}
          exposures={institutionExposures}
          onClose={() => setShowFgcAlert(false)}
        />
      )}
    </div>
  );
};
