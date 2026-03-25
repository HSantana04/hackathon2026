import { supabase } from '../lib/supabase';

export interface ExtractedPosition {
  asset_name: string;
  institution: string;
  amount: number;
  quantity: number;
  asset_type: string;
}

export async function extractPositionsWithAI(text: string): Promise<ExtractedPosition[]> {
  const { data, error } = await supabase.functions.invoke('extract-positions', {
    body: { text },
  });

  if (error) {
    throw new Error(`Erro na extração com IA: ${error.message}`);
  }

  if (!data?.positions || !Array.isArray(data.positions)) {
    return [];
  }

  return data.positions
    .filter((p: Record<string, unknown>) => p.asset_name && p.asset_type)
    .map((p: Record<string, unknown>) => ({
      asset_name: String(p.asset_name),
      institution: String(p.institution || 'Não identificada'),
      amount: Number(p.amount) || 0,
      quantity: Number(p.quantity) || 0,
      asset_type: String(p.asset_type),
    }));
}
