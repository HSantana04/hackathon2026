import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, Loader2, AlertCircle, Trash2, Pencil, Save, X, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { extractTextFromPdf } from '../services/pdfExtractor';
import { extractPositionsWithAI, type ExtractedPosition } from '../services/aiExtractor';
import { formatCurrency } from '../utils/formatCurrency';

interface Client {
  id: string;
  name: string;
}

type FlowStep = 'upload' | 'extracting' | 'preview' | 'saving' | 'success';

export const UploadStatement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<FlowStep>('upload');
  const [positions, setPositions] = useState<ExtractedPosition[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<ExtractedPosition | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('id, name')
      .order('name');

    if (data) {
      setClients(data);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      setPositions([]);
      handleExtract(selectedFile);
    }
  };

  const handleExtract = async (pdfFile: File) => {
    setStep('extracting');
    setError(null);
    try {
      const text = await extractTextFromPdf(pdfFile);
      if (!text.trim()) {
        throw new Error('Não foi possível extrair texto do PDF. Verifique se o arquivo não está protegido ou é uma imagem.');
      }
      const extracted = await extractPositionsWithAI(text);
      if (extracted.length === 0) {
        throw new Error('Nenhuma posição de investimento foi identificada no documento.');
      }
      setPositions(extracted);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao extrair posições do PDF');
      setStep('upload');
    }
  };

  const handleRemovePosition = (index: number) => {
    setPositions(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditValues(null);
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValues({ ...positions[index] });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValues(null);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null || !editValues) return;
    setPositions(prev => prev.map((p, i) => i === editingIndex ? editValues : p));
    setEditingIndex(null);
    setEditValues(null);
  };

  const handleConfirmAndSave = async () => {
    if (!selectedClient || positions.length === 0) return;

    setStep('saving');
    setError(null);
    try {
      const documentId = crypto.randomUUID();
      const fileUrl = `statements/${selectedClient}/${file?.name || 'statement.pdf'}`;

      const { error: docError } = await supabase
        .from('documents')
        .insert([{ id: documentId, client_id: selectedClient, file_url: fileUrl }]);

      if (docError) throw docError;

      const extractedPositions = positions.map(pos => ({
        document_id: documentId,
        asset_name: pos.asset_name,
        institution: pos.institution,
        amount: pos.amount,
        quantity: pos.quantity,
        asset_type: pos.asset_type,
        confirmed: false,
      }));

      const { error: extractError } = await supabase
        .from('extracted_positions')
        .insert(extractedPositions);

      if (extractError) throw extractError;

      setStep('success');
      setTimeout(() => navigate('/review'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar posições');
      setStep('preview');
    }
  };

  const handleReset = () => {
    setFile(null);
    setPositions([]);
    setError(null);
    setStep('upload');
    setEditingIndex(null);
    setEditValues(null);
  };

  const totalAmount = positions.reduce((sum, p) => sum + p.amount, 0);

  const clientOptions = [
    { value: '', label: 'Selecione um cliente' },
    ...clients.map(c => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload de Extrato</h1>
        <p className="mt-1 text-sm text-gray-600">
          Envie extratos em PDF para extrair automaticamente as posições de investimento
        </p>
      </div>

      {/* Seleção de cliente e upload */}
      <Card>
        <CardHeader>
          <CardTitle>Enviar Extrato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Select
            label="Cliente"
            options={clientOptions}
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            disabled={step === 'extracting' || step === 'saving'}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extrato em PDF
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              {file ? (
                <div className="space-y-4">
                  <FileText className="h-12 w-12 text-blue-600 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  {step === 'upload' && (
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                      Remover
                    </Button>
                  )}
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    Clique para enviar ou arraste o arquivo
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Apenas arquivos PDF</p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">Erro na extração</p>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Loading de extração */}
          {step === 'extracting' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <Loader2 className="h-8 w-8 text-blue-600 mx-auto animate-spin" />
              <p className="mt-3 text-sm font-medium text-blue-900">Extraindo posições com IA...</p>
              <p className="text-xs text-blue-700 mt-1">Lendo PDF e identificando ativos de investimento</p>
            </div>
          )}

          {/* Sucesso */}
          {step === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Upload realizado com sucesso!</p>
                <p className="text-xs text-green-700 mt-1">Redirecionando para revisão...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview das posições extraídas */}
      {step === 'preview' && positions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <CardTitle>Posições Extraídas ({positions.length})</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <X className="h-4 w-4 mr-1" />
                Recomeçar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Instituição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((pos, index) => (
                  <TableRow key={index}>
                    {editingIndex === index && editValues ? (
                      <>
                        <TableCell>
                          <Input
                            value={editValues.asset_name}
                            onChange={(e) => setEditValues({ ...editValues, asset_name: e.target.value })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editValues.institution}
                            onChange={(e) => setEditValues({ ...editValues, institution: e.target.value })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editValues.asset_type}
                            onChange={(e) => setEditValues({ ...editValues, asset_type: e.target.value })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editValues.quantity}
                            onChange={(e) => setEditValues({ ...editValues, quantity: Number(e.target.value) })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editValues.amount}
                            onChange={(e) => setEditValues({ ...editValues, amount: Number(e.target.value) })}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={handleSaveEdit}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell><span className="font-medium">{pos.asset_name}</span></TableCell>
                        <TableCell>{pos.institution}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                            {pos.asset_type}
                          </span>
                        </TableCell>
                        <TableCell>{pos.quantity}</TableCell>
                        <TableCell>{formatCurrency(pos.amount)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleStartEdit(index)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleRemovePosition(index)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell className="font-semibold">{formatCurrency(totalAmount)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Botão de salvar */}
      {step === 'preview' && positions.length > 0 && (
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleReset}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmAndSave}
            disabled={!selectedClient}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Carregar e Extrair Posições
          </Button>
        </div>
      )}

      {/* Salvando */}
      {step === 'saving' && (
        <Card>
          <CardContent className="py-8 text-center">
            <Loader2 className="h-8 w-8 text-blue-600 mx-auto animate-spin" />
            <p className="mt-3 text-sm font-medium text-gray-900">Salvando posições...</p>
          </CardContent>
        </Card>
      )}

      {/* Como funciona */}
      <Card className="bg-gray-50">
        <CardContent className="space-y-3">
          <h3 className="font-semibold text-gray-900">Como funciona</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600">1.</span>
              Selecione o cliente dono do extrato
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600">2.</span>
              Envie o extrato em PDF da instituição financeira
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600">3.</span>
              A IA extrai automaticamente as posições de investimento
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600">4.</span>
              Revise o preview e confirme para salvar no sistema
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};
