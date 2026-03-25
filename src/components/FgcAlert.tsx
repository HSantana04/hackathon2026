import { AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';

const FGC_LIMIT = 250_000;

interface InstitutionExposure {
  institution: string;
  total: number;
}

interface FgcAlertProps {
  clientId: string;
  clientName: string;
  exposures: InstitutionExposure[];
  onClose: () => void;
}

export const FgcAlert = ({ clientId, clientName, exposures, onClose }: FgcAlertProps) => {
  const navigate = useNavigate();
  const uncovered = exposures.filter((e) => e.total > FGC_LIMIT);

  if (uncovered.length === 0) return null;

  const totalUncovered = uncovered.reduce((sum, e) => sum + (e.total - FGC_LIMIT), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-red-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold">Alerta FGC</h2>
          </div>
          <p className="text-red-100 text-sm">
            Valores acima do limite de cobertura detectados
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-800">
                <strong>{clientName}</strong> possui{' '}
                <strong className="text-red-600">{formatCurrency(totalUncovered)}</strong>{' '}
                não coberto pelo FGC em {uncovered.length} instituição(ões).
              </p>
              <p className="text-xs text-slate-500 mt-1">
                O FGC cobre até R$ 250.000 por instituição financeira por CPF.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {uncovered.map((e) => (
              <div
                key={e.institution}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <span className="text-sm font-medium text-slate-700">{e.institution}</span>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(e.total)}
                  </p>
                  <p className="text-xs text-red-600 font-medium">
                    {formatCurrency(e.total - FGC_LIMIT)} descoberto
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                onClose();
                navigate(`/client/${clientId}/fgc`);
              }}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
            >
              Ver Cobertura FGC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
