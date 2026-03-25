import { useState } from 'react';
import { X, Upload, FileText, UserPlus, CheckCircle2 } from 'lucide-react';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddClientModal = ({ isOpen, onClose }: AddClientModalProps) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'csv'>('manual');
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      // Reset form
      setFormData({ name: '', email: '', phone: '' });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in px-4">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative border border-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
          <button 
            onClick={onClose}
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
          <p className="text-blue-100 text-sm">Insira os dados do cliente para começar a organizar sua carteira.</p>
        </div>

        {isSuccess ? (
          <div className="p-12 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Cliente Adicionado!</h3>
            <p className="text-slate-500 text-sm">O cliente foi salvo com sucesso em sua base de dados.</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              <button 
                onClick={() => setActiveTab('manual')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'manual' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <FileText className="h-4 w-4" />
                Manualmente
              </button>
              <button 
                onClick={() => setActiveTab('csv')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'csv' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Upload className="h-4 w-4" />
                Importar CSV
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6">
              {activeTab === 'manual' ? (
                <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(00) 00000-0000" 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl transition-all sm:text-sm"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                      Criar Cliente
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="font-medium text-slate-800">Clique para anexar ou arraste o arquivo</p>
                    <p className="text-sm text-slate-500 mt-1">Suporta arquivos .CSV menores que 10MB</p>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                      Cancelar
                    </button>
                    <button type="button" onClick={handleSubmit} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors">
                      Processar CSV
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
