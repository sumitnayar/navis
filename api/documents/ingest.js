// POST /api/documents/ingest
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!supabaseUrl || !supabaseKey || !openAiKey || !anthropicKey) {
    return res.status(500).json({ error: 'Ingestion pipeline unavailable due to missing configuration.' });
  }

  const { fileName, mimeType, base64Data, organizationId } = req.body;
  
  if (!fileName || !base64Data || !organizationId) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // Calculate approximate file size from base64 (limit: 3MB)
  const paddingBytes = (base64Data.match(/=/g) || []).length;
  const sizeInBytes = (base64Data.length * 0.75) - paddingBytes;
  if (sizeInBytes > 3 * 1024 * 1024) {
    return res.status(400).json({ error: 'File exceeds 3MB limit. Please split the document or contact support.' });
  }

  try {
    const fileBuffer = Buffer.from(base64Data, 'base64');
    let extractedText = '';

    // Step 1: Extract Text
    if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      const pdf = require('pdf-parse');
      const data = await pdf(fileBuffer);
      extractedText = data.text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.toLowerCase().endsWith('.docx')) {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = result.value;
    } else if (mimeType === 'text/plain' || fileName.toLowerCase().endsWith('.txt')) {
      extractedText = fileBuffer.toString('utf8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Use PDF, DOCX, or TXT.' });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'No text extracted from file.' });
    }

    // Step 2: Chunking (Approx 800 tokens = ~3200 chars, with 100 token overlap = ~400 chars)
    const MAX_CHUNK_LENGTH = 3200;
    const OVERLAP_LENGTH = 400;
    const chunks = [];
    
    // Simple naive chunking by character length to approximate tokens
    let i = 0;
    while (i < extractedText.length) {
      const end = Math.min(i + MAX_CHUNK_LENGTH, extractedText.length);
      let chunkText = extractedText.substring(i, end);
      
      // If not at the end, try to break at a newline or period
      if (end < extractedText.length) {
        const lastNewline = chunkText.lastIndexOf('\n');
        const lastPeriod = chunkText.lastIndexOf('. ');
        const breakPoint = Math.max(lastNewline, lastPeriod);
        
        if (breakPoint > MAX_CHUNK_LENGTH * 0.5) { // Ensure chunk isn't too small
          chunkText = chunkText.substring(0, breakPoint + 1);
          i += breakPoint + 1 - OVERLAP_LENGTH;
        } else {
          i += MAX_CHUNK_LENGTH - OVERLAP_LENGTH;
        }
      } else {
        i += MAX_CHUNK_LENGTH;
      }
      
      chunks.push({
        text: chunkText.trim(),
        token_count: Math.ceil(chunkText.length / 4)
      });
    }

    // Step 3: Embed each chunk
    const chunkTexts = chunks.map(c => c.text);
    const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiKey}`
      },
      body: JSON.stringify({
        input: chunkTexts,
        model: "text-embedding-3-small"
      })
    });

    if (!embeddingResponse.ok) {
      throw new Error(`OpenAI error: ${embeddingResponse.statusText}`);
    }

    const embeddingData = await embeddingResponse.json();
    chunks.forEach((chunk, idx) => {
      chunk.embedding = embeddingData.data[idx].embedding;
    });

    // Step 4: Store in Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: docRecord, error: docError } = await supabase
      .from('policy_documents')
      .insert({
        organization_id: organizationId,
        title: fileName.replace(/\.[^/.]+$/, ""), // remove extension
        document_type: 'Ingested Document',
        file_name: fileName,
        mime_type: mimeType,
        status: 'Processing',
        extracted_text: extractedText.substring(0, 50000) // Store subset if large
      })
      .select('id')
      .single();

    if (docError) throw docError;

    const chunkInserts = chunks.map((c, idx) => ({
      document_id: docRecord.id,
      organization_id: organizationId,
      chunk_index: idx,
      chunk_text: c.text,
      token_count: c.token_count,
      embedding: c.embedding
    }));

    const { error: chunkError } = await supabase
      .from('policy_document_chunks')
      .insert(chunkInserts);

    if (chunkError) throw chunkError;

    // Step 5: Generate Summary via Claude
    const first3000Tokens = extractedText.substring(0, 12000); // ~3000 tokens
    const prompt = `
You are an expert governance analyst. Summarize the following document in exactly three paragraphs:
1. What this document is (its nature and purpose).
2. What governance areas or topics it covers.
3. What specific organizational context, roles, or systems it reveals.

Document:
${first3000Tokens}
`;
    
    let summaryText = 'Summary generation failed.';
    try {
      const claudeResp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 500,
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (claudeResp.ok) {
        const cData = await claudeResp.json();
        summaryText = cData.content[0].text;
      }
    } catch (e) {
      console.warn("Summary generation warning:", e);
    }

    // Update document with summary and Ready status
    await supabase
      .from('policy_documents')
      .update({ status: 'Ready', summary: summaryText })
      .eq('id', docRecord.id);

    // Step 6: Return success
    return res.status(200).json({
      success: true,
      data: {
        documentId: docRecord.id,
        fileName: fileName,
        chunkCount: chunks.length,
        summary: summaryText,
        uploadDate: new Date().toISOString(),
        status: 'Ready'
      }
    });

  } catch (error) {
    console.error("Ingestion Pipeline Error:", error);
    return res.status(500).json({ error: 'Ingestion pipeline failed at processing stage.' });
  }
};
