import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Campo "text" ausente ou inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `Você é um parser de documentos financeiros brasileiros. Extraia todas as posições de investimento do texto de extrato bancário/corretora abaixo.

Para cada posição, extraia:
- asset_name: Nome do ativo (ex: "CDB Banco XP 120% CDI", "PETR4", "Tesouro IPCA+ 2035", "FII HGLG11")
- institution: Nome da instituição financeira (ex: "XP Investimentos", "BTG Pactual", "Nu Invest")
- amount: Valor monetário total em BRL (apenas número, sem símbolo de moeda)
- quantity: Número de unidades/cotas (apenas número, use 0 se não aplicável)
- asset_type: Um dos tipos: "Ação", "FII", "ETF", "CDB", "LCI", "LCA", "Debênture", "Tesouro Direto", "Fundo", "COE", "Poupança", "Outro"

Retorne APENAS um array JSON válido. Exemplo:
[
  {"asset_name": "PETR4", "institution": "XP Investimentos", "amount": 15000.50, "quantity": 500, "asset_type": "Ação"},
  {"asset_name": "CDB 120% CDI", "institution": "BTG Pactual", "amount": 50000, "quantity": 1, "asset_type": "CDB"}
]

Se não conseguir extrair nenhuma posição, retorne um array vazio: []

Texto do extrato:
${text.substring(0, 15000)}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um parser preciso de documentos financeiros brasileiros. Sempre retorne arrays JSON válidos.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return new Response(
        JSON.stringify({ error: `Erro na API OpenAI: ${response.status}`, details: errBody }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '[]';

    let positions;
    try {
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      positions = JSON.parse(jsonStr);
    } catch {
      positions = [];
    }

    return new Response(
      JSON.stringify({ positions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
