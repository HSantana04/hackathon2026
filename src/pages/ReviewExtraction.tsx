import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, CreditCard as Edit2, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type ExtractedPositionRow = Database['public']['Tables']['extracted_positions']['Row'];
type DocumentRow = Database['public']['Tables']['documents']['Row'];
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Input } from '../components/ui/Input';
import { formatCurrency } from '../utils/formatCurrency';

interface ExtractedPosition {
  id: string;
  document_id: string;
  asset_name: string;
  institution: string;
  amount: number;
  quantity: number;
  asset_type: string;
  confirmed: boolean;
}

export const ReviewExtraction = () => {
  const [positions, setPositions] = useState<ExtractedPosition[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ExtractedPosition>>({});
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadExtractedPositions();
  }, []);

  const loadExtractedPositions = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('extracted_positions')
        .select('*')
        .eq('confirmed', false)
        .order('created_at', { ascending: false })
        .returns<ExtractedPositionRow[]>();

      if (data) {
        setPositions(data);
      }
    } catch (error) {
      console.error('Error loading extracted positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (position: ExtractedPosition) => {
    setEditingId(position.id);
    setEditValues(position);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('extracted_positions')
        .update(editValues)
        .eq('id', id);

      if (error) throw error;

      setPositions(positions.map(p => p.id === id ? { ...p, ...editValues } : p));
      setEditingId(null);
      setEditValues({});
    } catch (error) {
      console.error('Error updating position:', error);
    }
  };

  const handleDiscard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('extracted_positions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPositions(positions.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error discarding position:', error);
    }
  };

  const handleConfirmAll = async () => {
    setConfirming(true);
    try {
      for (const position of positions) {
        const { data: document } = await supabase
          .from('documents')
          .select('client_id')
          .eq('id', position.document_id)
          .maybeSingle() as { data: Pick<DocumentRow, 'client_id'> | null };

        if (!document) continue;

        await supabase.from('positions').insert([{
          client_id: document.client_id,
          institution: position.institution,
          asset_name: position.asset_name,
          asset_type: position.asset_type,
          amount: position.amount,
          quantity: position.quantity,
          date: new Date().toISOString().split('T')[0],
        }]);

        await supabase
          .from('extracted_positions')
          .update({ confirmed: true })
          .eq('id', position.id);
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error confirming positions:', error);
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No extracted positions to review</p>
            <Button onClick={() => navigate('/upload')}>
              Upload Statement
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Extracted Positions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Verify and confirm the extracted investment positions
          </p>
        </div>
        <Button onClick={handleConfirmAll} disabled={confirming}>
          <CheckCircle className="h-4 w-4 mr-2" />
          {confirming ? 'Confirming...' : `Confirm All (${positions.length})`}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Extracted Positions</CardTitle>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell>
                    {editingId === position.id ? (
                      <Input
                        value={editValues.asset_name || ''}
                        onChange={(e) => setEditValues({ ...editValues, asset_name: e.target.value })}
                        className="min-w-[200px]"
                      />
                    ) : (
                      <span className="font-medium">{position.asset_name}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === position.id ? (
                      <Input
                        value={editValues.institution || ''}
                        onChange={(e) => setEditValues({ ...editValues, institution: e.target.value })}
                      />
                    ) : (
                      position.institution
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === position.id ? (
                      <Input
                        value={editValues.asset_type || ''}
                        onChange={(e) => setEditValues({ ...editValues, asset_type: e.target.value })}
                      />
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {position.asset_type}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === position.id ? (
                      <Input
                        type="number"
                        value={editValues.quantity || ''}
                        onChange={(e) => setEditValues({ ...editValues, quantity: Number(e.target.value) })}
                      />
                    ) : (
                      position.quantity
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === position.id ? (
                      <Input
                        type="number"
                        value={editValues.amount || ''}
                        onChange={(e) => setEditValues({ ...editValues, amount: Number(e.target.value) })}
                      />
                    ) : (
                      <span className="font-semibold text-green-600">
                        {formatCurrency(Number(position.amount))}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {editingId === position.id ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleSaveEdit(position.id)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(position)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDiscard(position.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent>
          <p className="text-sm text-blue-900">
            <strong>Review carefully:</strong> Once confirmed, these positions will be added to the client's portfolio.
            You can edit any field by clicking the edit icon, or discard incorrect entries.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
