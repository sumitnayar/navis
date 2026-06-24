const { createClient } = require('@supabase/supabase-js');

/**
 * Retrieves relevant policy document chunks based on intent using vector similarity.
 * @param {string} policyIntent - The query string to embed.
 * @param {string} organizationId - The organization context.
 * @returns {Array} List of chunks with similarity > 0.75
 */
async function retrieveRelevantChunks(policyIntent, organizationId) {
  if (!policyIntent || !organizationId) return [];

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (!supabaseUrl || !supabaseKey || !openAiKey) {
    console.error("Missing required environment variables for RAG retrieval.");
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Embed the policy intent string
    const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiKey}`
      },
      body: JSON.stringify({
        input: policyIntent,
        model: "text-embedding-3-small"
      })
    });

    if (!embeddingResponse.ok) {
      console.error(`OpenAI Embedding API error: ${embeddingResponse.statusText}`);
      return [];
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // 2. Query policy_document_chunks by cosine similarity via RPC
    const { data: chunks, error } = await supabase.rpc('match_policy_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.75, // 3. Return top 10 chunks with similarity > 0.75 only
      match_count: 10,
      org_id: organizationId
    });

    if (error) {
      console.error("Supabase RPC match_policy_chunks error:", error);
      return [];
    }

    // 4. Return chunks
    return chunks || [];
  } catch (error) {
    console.error("RAG Retrieval Error:", error);
    return [];
  }
}

module.exports = { retrieveRelevantChunks };
