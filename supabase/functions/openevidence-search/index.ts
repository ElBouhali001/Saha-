import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, specialty } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("OpenEvidence search request:", { query, specialty });

    // Construct the search query with specialty context
    const searchQuery = specialty 
      ? `${query} (${specialty})` 
      : query;

    // Call OpenEvidence API
    const response = await fetch("https://api.openevidence.com/v1/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 10,
        filters: {
          specialties: specialty ? [specialty] : undefined,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenEvidence API error:", response.status, errorText);
      throw new Error(`OpenEvidence API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the response to a consistent format
    const results = {
      query: searchQuery,
      results: data.results?.map((result: any) => ({
        title: result.title,
        summary: result.summary,
        url: result.url,
        source: result.source,
        publicationDate: result.publication_date,
        evidenceLevel: result.evidence_level,
        specialty: result.specialty,
      })) || [],
      totalResults: data.total || 0,
    };

    console.log(`Found ${results.totalResults} results for query: ${searchQuery}`);

    return new Response(
      JSON.stringify(results),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Error in openevidence-search function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to search OpenEvidence",
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
