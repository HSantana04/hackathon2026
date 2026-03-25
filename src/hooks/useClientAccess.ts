import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthRole } from './useAuthRole';

/**
 * Verifica se o usuário logado pode acessar dados do cliente `clientId`.
 * - Cliente: apenas o próprio `id`.
 * - Consultor: apenas clientes com `cpf_consultor` igual ao CPF do consultor.
 */
export function useClientAccess(clientId: string | undefined) {
  const { user, loading: authLoading, role, consultantCpf } = useAuthRole();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !clientId) {
      setAllowed(false);
      setChecking(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      if (role === 'cliente') {
        if (!cancelled) {
          setAllowed(user.id === clientId);
          setChecking(false);
        }
        return;
      }

      if (role === 'consultor' && consultantCpf) {
        const { data } = await supabase
          .from('clients')
          .select('cpf_consultor')
          .eq('id', clientId)
          .maybeSingle();

        if (!cancelled) {
          setAllowed(data?.cpf_consultor === consultantCpf);
          setChecking(false);
        }
        return;
      }

      if (!cancelled) {
        setAllowed(false);
        setChecking(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, clientId, role, consultantCpf]);

  return {
    allowed,
    checking: checking || authLoading,
  };
}
