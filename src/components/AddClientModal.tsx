import { useState, useRef } from 'react';
import { X, Upload, FileText, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** CPF do consultor logado — grava em `clients.cpf_consultor` para vincular o cliente. */
  consultantCpf?: string | null;
}

interface CsvRow {
  name: string;
  email: string;
  cpf: string;
}

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase().split(/[;,]/).map((h) => h.trim());
  const nameIdx = header.findIndex((h) => h === 'nome' || h === 'name');
  const emailIdx = header.findIndex((h) => h === 'email' || h === 'e-mail');
  const cpfIdx = header.findIndex((h) => h === 'cpf');

  if (nameIdx === -1 || emailIdx === -1 || cpfIdx === -1) return [];

  const separator = lines[0].includes(';') ? ';' : ',';

  return lines.slice(1).map((line) => {
    const cols = line.split(separator).map((c) => c.trim());
    return {
      name: cols[nameIdx] || '',
      email: cols[emailIdx] || '',
      cpf: cols[cpfIdx]?.replace(/\D/g, '') || '',
    };
  }).filter((r) => r.name && r.email && r.cpf);
}

export const AddClientModal = ({ isOpen, onClose, onSuccess, consultantCpf }: AddClientModalProps) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'csv'>('manual');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Manual form state
  const [formData, setFormData] = useState({ name: '', email: '', cpf: '' });

  // CSV state
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setFormData({ name: '', email: '', cpf: '' });
    setCsvRows([]);
    setCsvFileName(null);
    setError(null);
    setIsSuccess(false);
    setActiveTab('manual');
    onClose();
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cpfDigits = formData.cpf.replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
      setError('CPF deve conter 11 dígitos.');
      setLoading(false);
      return;
    }

    try {
      const insertData: { name: string; email: string; cpf?: string; cpf_consultor?: string } = {
        name: formData.name,
        email: formData.email,
      };
      if (cpfDigits) insertData.cpf = cpfDigits;
      if (consultantCpf) insertData.cpf_consultor = consultantCpf;

      const { error: insertError } = await supabase.from('clients').insert([insertData]);

      if (insertError) {
        if (insertError.message.includes('clients_cpf_unique')) {
          setError('Já existe um cliente com este CPF.');
        } else {
          throw insertError;
        }
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        resetAndClose();
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar cliente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Selecione um arquivo .csv');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCsv(text);
      if (rows.length === 0) {
        setError('CSV inválido. Colunas esperadas: nome, email, cpf');
        return;
      }
      setCsvRows(rows);
      setCsvFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleCsvImport = async () => {
    if (csvRows.length === 0) return;
    setError(null);
    setLoading(true);

    try {
      const payload = csvRows.map((r) => ({
        name: r.name,
        email: r.email,
        cpf: r.cpf.replace(/\D/g, ''),
        ...(consultantCpf ? { cpf_consultor: consultantCpf } : {}),
      }));

      const { error: insertError } = await supabase.from('clients').insert(payload);

      if (insertError) {
        if (insertError.message.includes('clients_cpf_unique')) {
          setError('Um ou mais CPFs já estão cadastrados.');
        } else {
          throw insertError;
        }
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        resetAndClose();
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar clientes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative border border-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
          <button 
            onClick={resetAndClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <UserPlus className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold">Adicionar Cliente</h2>
          </div>
          <p className="text-blue-100 text-sm">Insira os dados manualmente ou importe via CSV.</p>
        </div>

        {isSuccess ? (
          <div className="p-12 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {activeTab === 'csv' ? `${csvRows.length} cliente(s) importado(s)!` : 'Cliente Adicionado!'}
            </h3>
            <p className="text-slate-500 text-sm">Os dados foram salvos com sucesso.</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              <button 
                onClick={() => { setActiveTab('manual'); setError(null); }}
                className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'manual' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <FileText className="h-4 w-4" />
                Manualmente
              </button>
              <button 
                onClick={() => { setActiveTab('csv'); setError(null); }}
                className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'csv' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Upload className="h-4 w-4" />
                Importar CSV
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Content Body */}
            <div className="p-6">
              {activeTab === 'manual' ? (
                <form onSubmit={handleManualSubmit} className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: João Silva" 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl transition-all sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="joao@exemplo.com" 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl transition-all sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                    <input 
                      type="text" 
                      required
                      value={formData.cpf}
                      onChange={e => setFormData({ ...formData, cpf: formatCpf(e.target.value) })}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl transition-all sm:text-sm"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={resetAndClose} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50"
                    >
                      {loading ? 'Salvando...' : 'Criar Cliente'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="h-6 w-6 text-blue-600" />
                    </div>
                    {csvFileName ? (
                      <>
                        <p className="font-medium text-slate-800">{csvFileName}</p>
                        <p className="text-sm text-emerald-600 mt-1">{csvRows.length} cliente(s) encontrado(s)</p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-slate-800">Clique para selecionar o arquivo</p>
                        <p className="text-sm text-slate-500 mt-1">Formato: CSV com colunas <strong>nome</strong>, <strong>email</strong>, <strong>cpf</strong></p>
                      </>
                    )}
                  </div>

                  {/* CSV Preview */}
                  {csvRows.length > 0 && (
                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            <th className="text-left px-3 py-2 text-slate-500 font-medium">Nome</th>
                            <th className="text-left px-3 py-2 text-slate-500 font-medium">Email</th>
                            <th className="text-left px-3 py-2 text-slate-500 font-medium">CPF</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {csvRows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="px-3 py-2 text-slate-800">{row.name}</td>
                              <td className="px-3 py-2 text-slate-600">{row.email}</td>
                              <td className="px-3 py-2 text-slate-600">{formatCpf(row.cpf)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={resetAndClose} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                      Cancelar
                    </button>
                    <button 
                      type="button" 
                      onClick={handleCsvImport} 
                      disabled={csvRows.length === 0 || loading}
                      className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50"
                    >
                      {loading ? 'Importando...' : `Importar ${csvRows.length} cliente(s)`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
