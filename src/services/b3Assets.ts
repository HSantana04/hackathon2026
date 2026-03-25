export interface B3Asset {
  stock: string;
  name: string;
  type: string;
  close: number | null;
  change: number | null;
  volume: number | null;
  market_cap: number | null;
  logo: string;
  sector: string | null;
}

interface BrapiListResponse {
  stocks: {
    stock: string;
    name: string;
    type: string;
    close: number | null;
    change: number | null;
    volume: number | null;
    market_cap: number | null;
    logo: string;
    sector: string | null;
  }[];
}

export async function fetchB3Assets(search?: string): Promise<B3Asset[]> {
  const params = new URLSearchParams();
  params.set('sortBy', 'volume');
  params.set('sortOrder', 'desc');
  if (search) {
    params.set('search', search);
  }

  const response = await fetch(
    `https://brapi.dev/api/quote/list?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Erro ao buscar ativos: ${response.status}`);
  }

  const data: BrapiListResponse = await response.json();
  return data.stocks || [];
}
