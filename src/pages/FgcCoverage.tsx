import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, ShieldX, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';
import { useAuthRole } from '../hooks/useAuthRole';
import { useClientAccess } from '../hooks/useClientAccess';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { formatCurrency } from '../utils/formatCurrency';

type ClientRow = Database['public']['Tables']['clients']['Row'];
type PositionRow = Database['public']['Tables']['positions']['Row'];

const FGC_LIMIT = 250_000;

interface InstitutionRow {
  institution: string;
  total: number;
  covered: boolean;
  coveredAmount: number;
  uncoveredAmount: number;
}

export const FgcCoverage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuthRole();
  const { allowed, checking: accessChecking } = useClientAccess(id);
  const [clientName, setClientName] = useState('');
  const [rows, setRows] = useState<InstitutionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || accessChecking || !allowed) return;

    const load = async () => {
      setLoading(true);
      try {
        const { data: client } = await supabase
          .from('clients')
          .select('name')
          .eq('id', id)
          .maybeSingle() as { data: Pick<ClientRow, 'name'> | null };

        if (client) setClientName(client.name);

        const { data: positions } = await supabase
          .from('positions')
          .select('institution, amount')
          .eq('client_id', id)
          .returns<Pick<PositionRow, 'institution' | 'amount'>[]>();

        if (positions) {
          const grouped = positions.reduce((acc, p) => {
            const key = p.institution;
            acc[key] = (acc[key] || 0) + Number(p.amount);
            return acc;
          }, {} as Record<string, number>);

          const data: InstitutionRow[] = Object.entries(grouped)
            .map(([institution, total]) => ({
              institution,
              total,
              covered: total <= FGC_LIMIT,
              coveredAmount: Math.min(total, FGC_LIMIT),
              uncoveredAmount: Math.max(0, total - FGC_LIMIT),
            }))
            .sort((a, b) => b.total - a.total);

          setRows(data);
        }
      } catch (error) {
        console.error('Error loading FGC data:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, accessChecking, allowed]);

  const totalInvested = rows.reduce((s, r) => s + r.total, 0);
  const totalCovered = rows.reduce((s, r) => s + r.coveredAmount, 0);
  const totalUncovered = rows.reduce((s, r) => s + r.uncoveredAmount, 0);

  if (accessChecking || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-600">Você não tem permissão para ver esta página.</p>
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
        Voltar para {clientName}
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-amber-500" />
          Cobertura FGC — {clientName}
        </h1>
        <p className="text-slate-500 mt-1">
          O FGC garante até R$ 250.000 por instituição financeira por CPF.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Total Investido</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalInvested)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Coberto pelo FGC
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(totalCovered)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <ShieldX className="h-4 w-4 text-red-500" /> Não Coberto
            </p>
            <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalUncovered)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Instituição</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instituição</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right">Coberto (até R$ 250k)</TableHead>
                <TableHead className="text-right">Não Coberto</TableHead>
                <TableHead className="text-center">Coberto pelo FGC?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.institution} className={!row.covered ? 'bg-red-50/50' : ''}>
                  <TableCell className="font-medium">{row.institution}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(row.total)}
                  </TableCell>
                  <TableCell className="text-right text-emerald-600 font-medium">
                    {formatCurrency(row.coveredAmount)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {row.uncoveredAmount > 0 ? (
                      <span className="text-red-600">{formatCurrency(row.uncoveredAmount)}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.covered ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <ShieldCheck className="h-3.5 w-3.5" /> Sim
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        <ShieldX className="h-3.5 w-3.5" /> Não
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {rows.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              Nenhuma posição encontrada para este cliente.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
