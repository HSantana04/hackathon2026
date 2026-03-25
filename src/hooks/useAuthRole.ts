import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

export type AppRole = 'consultor' | 'cliente' | null;

type ConsultorRow = Database['public']['Tables']['consultores']['Row'];
type ClientRow = Database['public']['Tables']['clients']['Row'];

export interface UseAuthRoleResult {
  user: User | null;
  loading: boolean;
  role: AppRole;
  consultantCpf: string | null;
  consultantProfile: ConsultorRow | null;
  clientProfile: ClientRow | null;
  /** IDs de clientes que o usuário atual pode ver (consultor: vinculados ao CPF; cliente: só o próprio). */
  allowedClientIds: string[];
  refresh: () => Promise<void>;
}

export function useAuthRole(): UseAuthRoleResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole>(null);
  const [consultantCpf, setConsultantCpf] = useState<string | null>(null);
  const [consultantProfile, setConsultantProfile] = useState<ConsultorRow | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientRow | null>(null);
  const [allowedClientIds, setAllowedClientIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const u = session?.user ?? null;
      setUser(u);

      if (!u) {
        setRole(null);
        setConsultantCpf(null);
        setConsultantProfile(null);
        setClientProfile(null);
        setAllowedClientIds([]);
        return;
      }

      const [consultorRes, clientRes] = await Promise.all([
        supabase.from('consultores').select('*').eq('auth_user_id', u.id).maybeSingle(),
        supabase.from('clients').select('*').eq('id', u.id).maybeSingle(),
      ]);

      const consultor = consultorRes.data as ConsultorRow | null;
      const client = clientRes.data as ClientRow | null;

      if (consultor) {
        setRole('consultor');
        setConsultantCpf(consultor.cpf);
        setConsultantProfile(consultor);
        setClientProfile(null);

        const { data: linked } = await supabase
          .from('clients')
          .select('id')
          .eq('cpf_consultor', consultor.cpf)
          .returns<{ id: string }[]>();

        setAllowedClientIds((linked ?? []).map((r) => r.id));
      } else if (client) {
        setRole('cliente');
        setConsultantCpf(null);
        setConsultantProfile(null);
        setClientProfile(client);
        setAllowedClientIds([client.id]);
      } else {
        setRole(null);
        setConsultantCpf(null);
        setConsultantProfile(null);
        setClientProfile(null);
        setAllowedClientIds([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void load();
    });
    return () => subscription.unsubscribe();
  }, [load]);

  return {
    user,
    loading,
    role,
    consultantCpf,
    consultantProfile,
    clientProfile,
    allowedClientIds,
    refresh: load,
  };
}
