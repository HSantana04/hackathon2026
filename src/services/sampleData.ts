import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type ClientRow = Database['public']['Tables']['clients']['Row'];

const sampleClients = [
  { name: 'John Silva', email: 'john.silva@email.com' },
  { name: 'Maria Santos', email: 'maria.santos@email.com' },
  { name: 'Carlos Oliveira', email: 'carlos.oliveira@email.com' },
  { name: 'Ana Costa', email: 'ana.costa@email.com' },
];

const institutions = ['XP Investimentos', 'BTG Pactual', 'Itaú', 'Bradesco', 'Interactive Brokers', 'Avenue Securities'];

const assetTypes = ['Stock', 'Fund', 'CDB', 'Bond', 'ETF', 'Real Estate Fund'];

const assets = {
  Stock: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3'],
  Fund: ['XP Multi Strategy', 'BTG Total Return', 'Verde Asset', 'Dynamo Cougar', 'SPX Capital'],
  CDB: ['CDB XP 120% CDI', 'CDB BTG 115% CDI', 'CDB Itaú 110% CDI'],
  Bond: ['US Treasury 10Y', 'Brazil Treasury 2030', 'Corporate Bond AAA'],
  ETF: ['S&P 500 ETF', 'BOVA11', 'IVVB11', 'Nasdaq 100 ETF'],
  'Real Estate Fund': ['HGLG11', 'KNRI11', 'MXRF11', 'XPML11'],
};

const randomChoice = <T,>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const randomAmount = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateSamplePortfolio = async () => {
  try {
    for (const client of sampleClients) {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('email', client.email)
        .maybeSingle() as { data: Pick<ClientRow, 'id'> | null };

      let clientId: string;

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert([client])
          .select()
          .single() as { data: ClientRow | null; error: unknown };

        if (clientError) throw clientError;
        clientId = newClient!.id;
      }

      const numPositions = randomAmount(8, 15);
      const positions = [];

      for (let i = 0; i < numPositions; i++) {
        const assetType = randomChoice(assetTypes);
        const assetName = randomChoice(assets[assetType as keyof typeof assets]);
        const institution = randomChoice(institutions);
        const amount = randomAmount(5000, 500000);
        const quantity = randomChoice([1, 10, 50, 100, 500, 1000]);

        positions.push({
          client_id: clientId,
          institution,
          asset_name: assetName,
          asset_type: assetType,
          amount,
          quantity,
          date: new Date().toISOString().split('T')[0],
        });
      }

      const { error: positionsError } = await supabase
        .from('positions')
        .insert(positions);

      if (positionsError) throw positionsError;
    }

    return { success: true, message: 'Sample portfolio generated successfully!' };
  } catch (error) {
    console.error('Error generating sample portfolio:', error);
    return { success: false, message: 'Failed to generate sample portfolio' };
  }
};
