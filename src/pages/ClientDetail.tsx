import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type ClientRow = Database['public']['Tables']['clients']['Row'];
type PositionRow = Database['public']['Tables']['positions']['Row'];
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { formatCurrency } from '../utils/formatCurrency';

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
  const [client, setClient] = useState<Client | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

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
      } catch (error) {
        console.error('Error loading client data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/clients')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Clients
      </Button>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold">{client.name}</h1>
        <div className="mt-4 flex items-center gap-6 text-blue-100">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>{client.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Client since {new Date(client.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-sm text-blue-100">Total Portfolio Value</p>
          <p className="text-4xl font-bold mt-1">{formatCurrency(totalValue)}</p>
        </div>
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
              No positions found for this client
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
