const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ─── HackerNews (free, no key needed) ─────────────────────
async function searchHackerNews(keyword: string, days: number): Promise<any[]> {
  const results: any[] = [];
  try {
    const timestamp = Math.floor(Date.now() / 1000) - days * 86400;
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(keyword)}&tags=story&numericFilters=created_at_i>${timestamp}&hitsPerPage=5`;
    console.log('Searching HackerNews:', keyword);

    const res = await fetch(url);
    const data = await res.json();

    if (res.ok && data.hits) {
      for (const hit of data.hits) {
        results.push({
          keyword,
          title: hit.title || 'HackerNews post',
          url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
          source_type: 'hackernews',
          summary: `${hit.title} — ${hit.points || 0} puntos, ${hit.num_comments || 0} comentarios`,
          relevance_score: Math.min(1, (hit.points || 0) / 500 + 0.5),
          raw_data: { source: 'hackernews', points: hit.points, comments: hit.num_comments, objectID: hit.objectID },
        });
      }
    }
  } catch (e) {
    console.error(`HackerNews error for "${keyword}":`, e);
  }
  return results;
}

// ─── Firecrawl-based searches ─────────────────────────────
async function firecrawlSearch(apiKey: string, query: string, opts: { limit?: number; lang?: string; tbs?: string }): Promise<any[]> {
  try {
    const res = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: opts.limit || 5,
        lang: opts.lang || 'es',
        tbs: opts.tbs || 'qdr:m',
        scrapeOptions: { formats: ['markdown'] },
      }),
    });
    const data = await res.json();
    return res.ok && data.data ? data.data : [];
  } catch (e) {
    console.error(`Firecrawl search error for "${query}":`, e);
    return [];
  }
}

async function searchWeb(apiKey: string, keyword: string, industry: string | null): Promise<any[]> {
  const query = industry
    ? `${keyword} ${industry} tendencias ${new Date().getFullYear()}`
    : `${keyword} tendencias noticias ${new Date().getFullYear()}`;
  console.log('Searching web:', query);

  const data = await firecrawlSearch(apiKey, query, { limit: 5, tbs: 'qdr:m' });
  return data.map((r: any) => ({
    keyword,
    title: r.title || 'Sin título',
    url: r.url || '',
    source_type: 'web',
    summary: r.description || (r.markdown ? r.markdown.slice(0, 500) : ''),
    relevance_score: 0.7,
    raw_data: { source: 'firecrawl_search', query },
  }));
}

async function searchSocial(apiKey: string, keyword: string, network: string, industry: string | null): Promise<any[]> {
  const domain = network === 'LinkedIn' ? 'linkedin.com' : 'x.com';
  const query = `site:${domain} "${keyword}" ${industry || ''}`;
  console.log('Searching social:', query);

  const data = await firecrawlSearch(apiKey, query, { limit: 3, tbs: 'qdr:w' });
  return data.map((r: any) => ({
    keyword,
    title: r.title || 'Post social',
    url: r.url || '',
    source_type: 'social',
    summary: r.description || '',
    relevance_score: 0.6,
    raw_data: { source: 'firecrawl_search', network, query },
  }));
}

async function searchReddit(apiKey: string, keyword: string, industry: string | null): Promise<any[]> {
  const query = `site:reddit.com "${keyword}" ${industry || ''} ${new Date().getFullYear()}`;
  console.log('Searching Reddit:', query);

  const data = await firecrawlSearch(apiKey, query, { limit: 4, tbs: 'qdr:m' });
  return data.map((r: any) => ({
    keyword,
    title: r.title || 'Reddit post',
    url: r.url || '',
    source_type: 'reddit',
    summary: r.description || '',
    relevance_score: 0.65,
    raw_data: { source: 'firecrawl_search', network: 'Reddit', query },
  }));
}

async function searchYouTube(apiKey: string, keyword: string, industry: string | null): Promise<any[]> {
  const query = `site:youtube.com "${keyword}" ${industry || ''} ${new Date().getFullYear()}`;
  console.log('Searching YouTube:', query);

  const data = await firecrawlSearch(apiKey, query, { limit: 3, tbs: 'qdr:m' });
  return data.map((r: any) => ({
    keyword,
    title: r.title || 'Video de YouTube',
    url: r.url || '',
    source_type: 'youtube',
    summary: r.description || '',
    relevance_score: 0.65,
    raw_data: { source: 'firecrawl_search', network: 'YouTube', query },
  }));
}

// ─── Main Handler ─────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keywords, industry, networks, profile_name, sources, days } = await req.json();

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

    // Configurable sources (default: all)
    const enabledSources = sources && Array.isArray(sources) && sources.length > 0
      ? sources.map((s: string) => s.toLowerCase())
      : ['web', 'social', 'reddit', 'youtube', 'hackernews'];

    const timeWindow = Math.min(Math.max(days || 30, 7), 90);
    const allResults: any[] = [];

    for (const keyword of keywords.slice(0, 5)) {
      const promises: Promise<any[]>[] = [];

      // Web search (news + articles)
      if (enabledSources.includes('web')) {
        promises.push(searchWeb(apiKey, keyword, industry));
      }

      // Social (LinkedIn + X)
      if (enabledSources.includes('social')) {
        const socialNetworks = (networks || ['LinkedIn', 'X']).slice(0, 2);
        for (const net of socialNetworks) {
          promises.push(searchSocial(apiKey, keyword, net, industry));
        }
      }

      // Reddit
      if (enabledSources.includes('reddit')) {
        promises.push(searchReddit(apiKey, keyword, industry));
      }

      // YouTube
      if (enabledSources.includes('youtube')) {
        promises.push(searchYouTube(apiKey, keyword, industry));
      }

      // HackerNews (free API, no Firecrawl credits)
      if (enabledSources.includes('hackernews')) {
        promises.push(searchHackerNews(keyword, timeWindow));
      }

      // Run all sources in parallel per keyword
      const results = await Promise.all(promises);
      for (const batch of results) {
        allResults.push(...batch);
      }
    }

    // Sort by relevance score descending
    allResults.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));

    console.log(`Research complete: ${allResults.length} results from ${enabledSources.join(', ')} for ${keywords.length} keywords`);

    return new Response(
      JSON.stringify({ success: true, results: allResults, total: allResults.length, sources_used: enabledSources }),
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
