const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keywords, industry, networks, profile_name } = await req.json();

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Keywords are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl no está configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const allResults: any[] = [];

    for (const keyword of keywords.slice(0, 5)) {
      // Web search: news + articles
      const webQuery = industry
        ? `${keyword} ${industry} tendencias ${new Date().getFullYear()}`
        : `${keyword} tendencias noticias ${new Date().getFullYear()}`;

      console.log('Searching web:', webQuery);

      try {
        const webRes = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: webQuery,
            limit: 5,
            lang: 'es',
            country: 'MX',
            tbs: 'qdr:m', // last month
            scrapeOptions: { formats: ['markdown'] },
          }),
        });

        const webData = await webRes.json();
        if (webRes.ok && webData.data) {
          for (const result of webData.data) {
            allResults.push({
              keyword,
              title: result.title || 'Sin título',
              url: result.url || '',
              source_type: 'web',
              summary: result.description || (result.markdown ? result.markdown.slice(0, 500) : ''),
              relevance_score: 0.7,
              raw_data: { source: 'firecrawl_search', query: webQuery },
            });
          }
        }
      } catch (e) {
        console.error(`Web search error for "${keyword}":`, e);
      }

      // Social search: LinkedIn + X
      const socialNetworks = (networks || ['LinkedIn', 'X']).slice(0, 2);
      for (const net of socialNetworks) {
        const socialQuery = `site:${net === 'LinkedIn' ? 'linkedin.com' : 'x.com'} "${keyword}" ${industry || ''}`;
        console.log('Searching social:', socialQuery);

        try {
          const socialRes = await fetch('https://api.firecrawl.dev/v1/search', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: socialQuery,
              limit: 3,
              lang: 'es',
              tbs: 'qdr:w', // last week for social
            }),
          });

          const socialData = await socialRes.json();
          if (socialRes.ok && socialData.data) {
            for (const result of socialData.data) {
              allResults.push({
                keyword,
                title: result.title || 'Post social',
                url: result.url || '',
                source_type: 'social',
                summary: result.description || '',
                relevance_score: 0.6,
                raw_data: { source: 'firecrawl_search', network: net, query: socialQuery },
              });
            }
          }
        } catch (e) {
          console.error(`Social search error for "${keyword}" on ${net}:`, e);
        }
      }
    }

    console.log(`Research complete: ${allResults.length} results for ${keywords.length} keywords`);

    return new Response(
      JSON.stringify({ success: true, results: allResults, total: allResults.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error researching trends:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Error investigando tendencias' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
