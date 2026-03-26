import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, TrendingUp, TrendingDown, Minus, RefreshCw, Database, X } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Select } from '../components/ui/Select';
import { fetchB3Assets, type B3Asset } from '../services/b3Assets';
import { formatCurrency } from '../utils/formatCurrency';

const ASSET_TYPE_OPTIONS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'stock', label: 'Ações' },
  { value: 'fund', label: 'Fundos' },
  { value: 'bdr', label: 'BDRs' },
];

interface FundDetailState {
  asset_name: string;
  institution: string;
  asset_type: string;
  amount: number;
  quantity: number;
  date: string;
}

export const B3Assets = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [assets, setAssets] = useState<B3Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<B3Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const [fundDetail, setFundDetail] = useState<FundDetailState | null>(null);

  useEffect(() => {
    const state = location.state as { fundDetail?: FundDetailState } | null;
    if (state?.fundDetail) {
      setFundDetail(state.fundDetail);
      // Clear the state so it doesn't persist on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchB3Assets();
      setAssets(data);
      setFilteredAssets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ativos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  useEffect(() => {
    let result = assets;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.stock.toLowerCase().includes(term) ||
          a.name.toLowerCase().includes(term) ||
          (a.sector && a.sector.toLowerCase().includes(term))
      );
    }

    if (typeFilter) {
      result = result.filter((a) => a.type === typeFilter);
    }

    setFilteredAssets(result);
    setPage(1);
  }, [searchTerm, typeFilter, assets]);

  const paginatedAssets = filteredAssets.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredAssets.length / pageSize);

  const formatVolume = (volume: number | null) => {
    if (volume === null || volume === undefined) return '—';
    if (volume >= 1_000_000_000) return `${(volume / 1_000_000_000).toFixed(1)}B`;
    if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`;
    if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}K`;
    return volume.toLocaleString('pt-BR');
  };

  const formatMarketCap = (cap: number | null) => {
    if (cap === null || cap === undefined) return '—';
    if (cap >= 1_000_000_000) return `R$ ${(cap / 1_000_000_000).toFixed(1)}B`;
    if (cap >= 1_000_000) return `R$ ${(cap / 1_000_000).toFixed(1)}M`;
    return formatCurrency(cap);
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      stock: 'Ação',
      fund: 'Fundo',
      bdr: 'BDR',
    };
    return map[type] || type;
  };

  const getTypeBadgeClass = (type: string) => {
    const map: Record<string, string> = {
      stock: 'bg-blue-100 text-blue-700',
      fund: 'bg-purple-100 text-purple-700',
      bdr: 'bg-amber-100 text-amber-700',
    };
    return map[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-600" />
            Ativos B3
          </h1>
          <p className="text-slate-500 mt-1">
            Referência de ativos listados na bolsa brasileira
          </p>
        </div>
        <Button onClick={loadAssets} disabled={loading} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por ticker, nome ou setor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={ASSET_TYPE_OPTIONS}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-500">
            {filteredAssets.length} ativo(s) encontrado(s)
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                <span className="text-slate-500 text-sm">Carregando ativos da B3...</span>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead className="text-right">Preço (R$)</TableHead>
                    <TableHead className="text-right">Variação</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-right">Market Cap</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAssets.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-10 text-center text-slate-500">
                        Nenhum ativo encontrado.
                      </td>
                    </tr>
                  ) : (
                    paginatedAssets.map((asset) => (
                      <TableRow key={asset.stock}>
                        <TableCell>
                          {asset.logo ? (
                            <img
                              src={asset.logo}
                              alt={asset.stock}
                              className="h-8 w-8 rounded-full object-contain bg-white border border-slate-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                              {asset.stock.slice(0, 2)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-slate-900">
                            {asset.stock}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-600 text-sm truncate max-w-[200px] block">
                            {asset.name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeClass(asset.type)}`}>
                            {getTypeLabel(asset.type)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-500 text-sm">
                            {asset.sector || '—'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {asset.close !== null ? formatCurrency(asset.close) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {asset.change !== null ? (
                            <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                              asset.change > 0
                                ? 'text-emerald-600'
                                : asset.change < 0
                                ? 'text-red-600'
                                : 'text-slate-500'
                            }`}>
                              {asset.change > 0 ? (
                                <TrendingUp className="h-3.5 w-3.5" />
                              ) : asset.change < 0 ? (
                                <TrendingDown className="h-3.5 w-3.5" />
                              ) : (
                                <Minus className="h-3.5 w-3.5" />
                              )}
                              {asset.change > 0 ? '+' : ''}{asset.change.toFixed(2)}%
                            </span>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-right text-slate-600 text-sm">
                          {formatVolume(asset.volume)}
                        </TableCell>
                        <TableCell className="text-right text-slate-600 text-sm">
                          {formatMarketCap(asset.market_cap)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                  <span className="text-sm text-slate-500">
                    Página {page} de {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Fund Detail Popup */}
      {fundDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Detalhes do Fundo</h2>
              <button
                onClick={() => setFundDetail(null)}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-slate-500">Ativo</span>
                  <span className="text-sm font-semibold text-slate-900 text-right max-w-[60%]">
                    {fundDetail.asset_name}
                  </span>
                </div>
                <div className="border-t border-slate-100" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Instituição</span>
                  <span className="text-sm font-medium text-slate-700">{fundDetail.institution}</span>
                </div>
                <div className="border-t border-slate-100" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Tipo</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    {fundDetail.asset_type}
                  </span>
                </div>
                <div className="border-t border-slate-100" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Quantidade</span>
                  <span className="text-sm font-medium text-slate-700">{fundDetail.quantity}</span>
                </div>
                <div className="border-t border-slate-100" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Valor</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {formatCurrency(Number(fundDetail.amount))}
                  </span>
                </div>
                <div className="border-t border-slate-100" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Data</span>
                  <span className="text-sm font-medium text-slate-700">
                    {new Date(fundDetail.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <Button
                  onClick={() => setFundDetail(null)}
                  className="w-full"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
