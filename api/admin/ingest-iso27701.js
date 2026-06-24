const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');

const batchFiles = [
  require('../../scripts/iso27701_batch1.json'),
  require('../../scripts/iso27701_batch2.json'),
  require('../../scripts/iso27701_batch3.json'),
  require('../../scripts/iso27701_batch4.json'),
  require('../../scripts/iso27701_batch5.json'),
  require('../../scripts/iso27701_batch6a.json'),
  require('../../scripts/iso27701_batch6b.json'),
  require('../../scripts/iso27701_batch7.json')
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { token } = req.query;
  if (!token || token !== process.env.ADMIN_INGEST_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
    const supabase = createClient(process.env.SUPABASE_URL, supabaseKey);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let allChunks = [];
    for (const batch of batchFiles) {
      allChunks = allChunks.concat(batch);
    }

    let successCount = 0;
    let annexACount = 0;

    for (let i = 0; i < allChunks.length; i++) {
      const chunk = allChunks[i];
      if (chunk.section_reference && chunk.section_reference.startsWith('A.')) {
        annexACount++;
      }
      
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk.chunk_text,
      });

      const embedding = response.data[0].embedding;

      const { error } = await supabase
        .from('policy_document_chunks')
        .insert({
          document_name: 'ISO/IEC 27701:2025',
          content: chunk.chunk_text,
          embedding: embedding,
          is_system: true,
          organization_id: null,
          metadata: {
            section_reference: chunk.section_reference,
            section_title: chunk.section_title,
            applies_to: chunk.applies_to
          }
        });

      if (error) {
        console.error(`Error inserting chunk ${chunk.section_reference}:`, error);
        throw error;
      } else {
        successCount++;
      }
    }

    // Verification Query
    const queryResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: "lawful basis for PII processing",
    });
    
    const queryEmbedding = queryResponse.data[0].embedding;

    // First try match_regulatory_chunks, fallback to match_policy_chunks if needed
    let results, matchError;
    const rpcCall = await supabase.rpc('match_regulatory_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.75,
      match_count: 5,
      metadata_filter: {}
    });
    
    if (rpcCall.error && rpcCall.error.message.includes('function match_regulatory_chunks does not exist')) {
        const fallbackCall = await supabase.rpc('match_policy_chunks', {
          query_embedding: queryEmbedding,
          match_threshold: 0.75,
          match_count: 5,
          metadata_filter: {}
        });
        results = fallbackCall.data;
        matchError = fallbackCall.error;
    } else {
        results = rpcCall.data;
        matchError = rpcCall.error;
    }

    if (matchError) {
      throw matchError;
    }

    let topMatch = null;
    let topSimilarity = 0;
    if (results && results.length > 0) {
      topMatch = results[0];
      topSimilarity = results[0].similarity;
    }

    return res.status(200).json({
      message: 'Ingestion complete',
      total_chunks_inserted: successCount,
      annex_a_chunk_count: annexACount,
      verification: {
        query: "lawful basis for PII processing",
        top_match_reference: topMatch ? topMatch.metadata.section_reference : null,
        top_match_title: topMatch ? topMatch.metadata.section_title : null,
        top_similarity_score: topSimilarity,
        total_matches_above_threshold: results ? results.length : 0
      }
    });

  } catch (error) {
    console.error('Ingestion error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
