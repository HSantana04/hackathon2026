import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';
import { useAuthRole } from '../hooks/useAuthRole';

type ClientRow = Database['public']['Tables']['clients']['Row'];
type PositionRow = Database['public']['Tables']['positions']['Row'];
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { formatCurrency } from '../utils/formatCurrency';
import { AddClientModal } from '../components/AddClientModal';

interface Client {
  id: string;
  name: string;
  email: string;
  cpf: string | null;
  created_at: string;
  totalValue?: number;
}

export const Clients = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, role, consultantCpf, refresh } = useAuthRole();

  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (role === 'cliente') {
      navigate('/client-dashboard', { replace: true });
    }
  }, [authLoading, user, role, navigate]);

  const loadClients = async (showSpinner = true) => {
    if (role !== 'consultor' || !consultantCpf) return;
    if (showSpinner) setLoading(true);
    try {
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .eq('cpf_consultor', consultantCpf)
        .returns<ClientRow[]>()
        .order('created_at', { ascending: false });

      if (!clientsData) return;

      const clientsWithValues = await Promise.all(
        clientsData.map(async (client) => {
          const { data: positions } = await supabase
            .from('positions')
            .select('amount')
            .eq('client_id', client.id)
            .returns<Pick<PositionRow, 'amount'>[]>();

          const totalValue = positions?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

          return { ...client, totalValue };
        })
      );

      setClients(clientsWithValues);
      setFilteredClients(clientsWithValues);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || role !== 'consultor' || !consultantCpf) return;
    void loadClients();
  }, [authLoading, role, consultantCpf]);

  useEffect(() => {
    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.cpf && client.cpf.includes(searchTerm.replace(/\D/g, '')))
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  if (authLoading || loading || role !== 'consultor') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-1 text-sm text-gray-600">
            Clientes vinculados ao seu CPF como consultor
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Patrimônio Total</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="text-gray-600">{client.email}</TableCell>
                  <TableCell className="text-gray-600 font-mono text-sm">
                    {client.cpf
                      ? `${client.cpf.slice(0,3)}.${client.cpf.slice(3,6)}.${client.cpf.slice(6,9)}-${client.cpf.slice(9)}`
                      : '—'}
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {formatCurrency(client.totalValue || 0)}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(client.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/client/${client.id}`)}
                    >
                      Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredClients.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Nenhum cliente encontrado
            </div>
          )}
        </CardContent>
      </Card>

      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          void refresh();
          void loadClients(false);
        }}
        consultantCpf={consultantCpf}
      />
    </div>
  );
};
