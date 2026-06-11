// Document Extraction Service — Risk Intelligence Desk
// Handles file text extraction, Gemini AI extraction, document chunking, and delta detection.

import { AIService } from './aiService.js';

export class DocumentExtractionService {

  // ─── TEXT EXTRACTION ──────────────────────────────────────────────────────

  /**
   * Extract raw text from an uploaded file.
   * Returns { text: string, error: string|null, fileType: string }
   */
  static async extractText(file) {
    const name = file.name.toLowerCase();
    const ext = name.split('.').pop();

    try {
      if (ext === 'pdf') {
        return await this._extractPDF(file);
      } else if (ext === 'xlsx' || ext === 'xls') {
        return await this._extractExcel(file);
      } else if (ext === 'csv') {
        return await this._extractCSV(file);
      } else if (ext === 'docx') {
        return await this._extractWord(file);
      } else if (ext === 'txt' || ext === 'md') {
        return await this._extractPlain(file);
      } else {
        return { text: '', error: `Unsupported file type: .${ext}. Please upload a PDF, Word, Excel, CSV, Text, or Markdown document.`, fileType: ext };
      }
    } catch (err) {
      console.error('Text extraction error:', err);
      return { text: '', error: `Failed to read the document. Please check the file is not corrupted. (${err.message})`, fileType: ext };
    }
  }

  static async _extractPDF(file) {
    const pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) {
      return { text: '', error: 'PDF processing library failed to load. Please refresh and try again.', fileType: 'pdf' };
    }

    // Set the worker source (classic build CDN)
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.js';

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    // Detect scanned PDF: very little extractable text
    if (fullText.replace(/\s/g, '').length < 50) {
      return {
        text: '',
        error: 'This document appears to be a scanned image. Please upload a text-based PDF.',
        fileType: 'pdf'
      };
    }

    return { text: fullText.trim(), error: null, fileType: 'pdf' };
  }

  static async _extractExcel(file) {
    const XLSX = window.XLSX;
    if (!XLSX) {
      return { text: '', error: 'Excel processing library failed to load. Please refresh and try again.', fileType: 'xlsx' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    let fullText = '';

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      fullText += `Sheet: ${sheetName}\n${csv}\n\n`;
    }

    return { text: fullText.trim(), error: null, fileType: 'xlsx' };
  }

  static async _extractCSV(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ text: e.target.result || '', error: null, fileType: 'csv' });
      reader.onerror = () => resolve({ text: '', error: 'Failed to read CSV file.', fileType: 'csv' });
      reader.readAsText(file);
    });
  }

  static async _extractPlain(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      const ext = file.name.toLowerCase().split('.').pop();
      reader.onload = (e) => resolve({ text: e.target.result || '', error: null, fileType: ext });
      reader.onerror = () => resolve({ text: '', error: `Failed to read ${ext.toUpperCase()} file.`, fileType: ext });
      reader.readAsText(file);
    });
  }

  static async _extractWord(file) {
    const mammoth = window.mammoth;
    if (!mammoth) {
      return { text: '', error: 'Word document processing library failed to load. Please refresh and try again.', fileType: 'docx' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return { text: result.value || '', error: null, fileType: 'docx' };
  }

  // ─── CHUNKING ─────────────────────────────────────────────────────────────

  /**
   * Split long text into overlapping chunks.
   * Returns array of strings.
   */
  static chunkText(text, chunkSize = 20000, overlap = 2000) {
    if (text.length <= chunkSize) return [text];
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      chunks.push(text.slice(start, start + chunkSize));
      if (start + chunkSize >= text.length) break;
      start += chunkSize - overlap;
    }
    return chunks;
  }

  /**
   * Split long policy text into overlapping chunks based on word count.
   * Returns array of objects { chunk_index, chunk_text, section_title, page_number, token_count }
   */
  static chunkPolicyText(text) {
    const minWords = 700;
    const maxWords = 1000;
    const overlapWords = 120;
    
    // Split text by whitespace into words, keeping newline characters attached
    const words = text.split(/([ \t\r\n]+)/).filter(w => w.length > 0);
    
    // Count non-whitespace tokens to represent words
    const isWhitespace = (s) => /^[ \t\r\n]+$/.test(s);
    const wordTokens = [];
    for (let i = 0; i < words.length; i++) {
      if (!isWhitespace(words[i])) {
        wordTokens.push({ word: words[i], idx: i });
      }
    }

    if (wordTokens.length === 0) return [];

    if (wordTokens.length <= maxWords) {
      let sectionTitle = null;
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (/^(section|article|part)\s+\d+/i.test(trimmed)) {
          sectionTitle = trimmed.slice(0, 100);
          break;
        }
      }
      return [{
        chunk_index: 0,
        chunk_text: text,
        section_title: sectionTitle || 'General',
        page_number: 1,
        token_count: Math.round(wordTokens.length * 1.3)
      }];
    }

    const chunks = [];
    let startTokenIdx = 0;
    let chunkIndex = 0;

    while (startTokenIdx < wordTokens.length) {
      let endTokenIdx = startTokenIdx + maxWords;
      if (endTokenIdx > wordTokens.length) {
        endTokenIdx = wordTokens.length;
      }

      // Look back for a good section boundary in the overlap window
      let adjustedEndTokenIdx = endTokenIdx;
      if (endTokenIdx < wordTokens.length) {
        const lookbackLimit = Math.max(startTokenIdx + minWords, endTokenIdx - overlapWords);
        for (let i = endTokenIdx - 1; i >= lookbackLimit; i--) {
          const w = wordTokens[i].word;
          if (w === 'Section' || w === 'SECTION' || w === 'Article' || w === 'ARTICLE' || (w.toUpperCase() === w && w.endsWith('.'))) {
            adjustedEndTokenIdx = i;
            break;
          }
        }
      }

      const sliceStart = wordTokens[startTokenIdx].idx;
      const sliceEnd = wordTokens[adjustedEndTokenIdx - 1].idx + 1;
      const chunkTextStr = words.slice(sliceStart, sliceEnd).join('').trim();
      
      // Simple section detection
      let sectionTitle = null;
      const lines = chunkTextStr.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (/^(section|article|part)\s+\d+/i.test(trimmed)) {
          sectionTitle = trimmed.slice(0, 100);
          break;
        }
      }

      // Page number detection: look for "Page X"
      let pageNumber = 1;
      const pageMatch = chunkTextStr.match(/page\s+(\d+)/i);
      if (pageMatch) {
        pageNumber = parseInt(pageMatch[1]);
      } else {
        pageNumber = Math.max(1, Math.ceil(startTokenIdx / 300));
      }

      chunks.push({
        chunk_index: chunkIndex++,
        chunk_text: chunkTextStr,
        section_title: sectionTitle || 'General',
        page_number: pageNumber,
        token_count: Math.round((adjustedEndTokenIdx - startTokenIdx) * 1.3)
      });

      if (adjustedEndTokenIdx >= wordTokens.length) break;
      startTokenIdx = adjustedEndTokenIdx - overlapWords;
      if (startTokenIdx < 0) startTokenIdx = 0;
    }

    return chunks;
  }


  // ─── GEMINI EXTRACTION ────────────────────────────────────────────────────

  /**
   * Extract risk intelligence from document text using Gemini.
   * Handles chunking for long documents automatically.
   * Returns { result: parsedJSON, segments: number, error: string|null }
   */
  static async extractWithGemini(documentText, existingRisks, settings) {
    const CHUNK_THRESHOLD = 25000;
    const CHUNK_SIZE = 20000;
    const CHUNK_OVERLAP = 2000;

    const apiKey = settings.geminiApiKey || '';

    // Build a compact existing risks context
    const existingContext = existingRisks.slice(0, 30).map(r => ({
      id: r.id,
      title: r.title,
      category: r.category,
      likelihood: r.likelihood,
      impact: r.impact,
      residualScore: r.residualScore,
      owner: r.owner
    }));

    const chunks = documentText.length > CHUNK_THRESHOLD
      ? this.chunkText(documentText, CHUNK_SIZE, CHUNK_OVERLAP)
      : [documentText];

    const segmentResults = [];

    for (let i = 0; i < chunks.length; i++) {
      const prompt = this._buildExtractionPrompt(chunks[i], existingContext, i + 1, chunks.length);
      try {
        const rawResponse = await AIService.queryGemini(prompt, apiKey);
        const parsed = this._parseGeminiResponse(rawResponse);
        segmentResults.push(parsed);
      } catch (err) {
        console.error(`Gemini extraction failed on chunk ${i + 1}:`, err);
        if (segmentResults.length === 0) {
          return {
            result: null,
            segments: chunks.length,
            error: 'Extraction encountered an issue. Please try again or upload a different version of this document.'
          };
        }
        // If at least one chunk succeeded, continue with partial results
      }
    }

    if (segmentResults.length === 0) {
      return { result: null, segments: chunks.length, error: 'No extraction results could be obtained from this document.' };
    }

    const merged = this._mergeSegmentResults(segmentResults);
    return { result: merged, segments: chunks.length, error: null };
  }

  static _buildExtractionPrompt(documentText, existingContext, chunkIndex, totalChunks) {
    const chunkNote = totalChunks > 1
      ? `NOTE: This is segment ${chunkIndex} of ${totalChunks} of a large document. Extract all risk-relevant content from this segment only.`
      : '';

    return `You are a risk intelligence extraction engine for an enterprise risk management platform.
Your task is to read the provided document and extract ALL risk-relevant content.
You must return ONLY valid JSON — no markdown, no explanation, no code fences, no backticks.

${chunkNote}

EXISTING RISK REGISTER (for reference — do not re-extract these unless the document adds new information):
${JSON.stringify(existingContext)}

EXTRACTION INSTRUCTIONS:
Extract the following from the document and return a single JSON object matching this schema exactly:
{
  "document_type": "risk_register | policy | audit_report | board_paper | compliance_doc | other",
  "document_summary": "2-3 sentence description of what this document is",
  "extracted_risks": [
    {
      "title": "risk name",
      "description": "brief description",
      "category": "detected category",
      "likelihood": null,
      "impact": null,
      "owner": null,
      "kri_references": [],
      "source_reference": "page or section if detectable",
      "confidence": "high | medium | low"
    }
  ],
  "extracted_controls": [
    {
      "title": "control name",
      "type": "preventive | detective | corrective",
      "linked_risk_hint": "which risk this relates to",
      "effectiveness": null,
      "confidence": "high | medium | low"
    }
  ],
  "extracted_policies": [
    {
      "policy_name": "name",
      "appetite_statements": [],
      "kri_thresholds": [],
      "confidence": "high | medium | low"
    }
  ],
  "extracted_actions": [
    {
      "title": "action item",
      "owner": null,
      "due_date": null,
      "source_reference": "where in document",
      "confidence": "high | medium | low"
    }
  ],
  "gaps_detected": []
}

Rules:
- likelihood and impact must be integers 1-5 or null if not determinable
- confidence must be exactly "high", "medium", or "low"
- If no items of a type are found, return an empty array []
- Do NOT include any text outside the JSON object
- Do NOT wrap in markdown code blocks

DOCUMENT TEXT:
${documentText}`;
  }

  static _parseGeminiResponse(rawText) {
    // Strip markdown code fences if present
    let cleaned = rawText.trim();
    const bt = String.fromCharCode(96);
    const regex1 = new RegExp('^' + bt + bt + bt + 'json\\\\s*', 'i');
    const regex2 = new RegExp('^' + bt + bt + bt + '\\\\s*', 'i');
    const regex3 = new RegExp('\\\\s*' + bt + bt + bt + '$', 'i');
    cleaned = cleaned.replace(regex1, '').replace(regex2, '').replace(regex3, '').trim();
    
    // Find the JSON object boundaries
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }

    return JSON.parse(cleaned);
  }

  // ─── MERGE SEGMENT RESULTS ────────────────────────────────────────────────

  static _mergeSegmentResults(segments) {
    if (segments.length === 1) return segments[0];

    const merged = {
      document_type: segments[0].document_type || 'other',
      document_summary: segments[0].document_summary || '',
      extracted_risks: [],
      extracted_controls: [],
      extracted_policies: [],
      extracted_actions: [],
      gaps_detected: []
    };

    const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();

    // Deduplicate by normalized title
    const addIfUnique = (existing, newItems, titleKey = 'title') => {
      const existingNorm = new Set(existing.map(item => normalize(item[titleKey])));
      for (const item of (newItems || [])) {
        const norm = normalize(item[titleKey]);
        if (!existingNorm.has(norm)) {
          existing.push(item);
          existingNorm.add(norm);
        }
      }
    };

    for (const seg of segments) {
      addIfUnique(merged.extracted_risks, seg.extracted_risks, 'title');
      addIfUnique(merged.extracted_controls, seg.extracted_controls, 'title');
      addIfUnique(merged.extracted_policies, seg.extracted_policies, 'policy_name');
      addIfUnique(merged.extracted_actions, seg.extracted_actions, 'title');
      // Gaps: add all unique strings
      const existingGaps = new Set(merged.gaps_detected.map(normalize));
      for (const gap of (seg.gaps_detected || [])) {
        if (!existingGaps.has(normalize(gap))) {
          merged.gaps_detected.push(gap);
          existingGaps.add(normalize(gap));
        }
      }
    }

    return merged;
  }

  // ─── DELTA DETECTION ─────────────────────────────────────────────────────

  /**
   * Determine whether an extracted risk is New, Update, Duplicate, or Conflict
   * relative to the existing risk register.
   */
  static computeDeltaStatus(extractedRisk, existingRisks) {
    const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    const wordSet = (str) => new Set(normalize(str).split(' ').filter(w => w.length > 2));

    const extractedWords = wordSet(extractedRisk.title);
    let bestMatch = null;
    let bestOverlap = 0;

    for (const existing of existingRisks) {
      const existingNorm = normalize(existing.title);
      const extractedNorm = normalize(extractedRisk.title);

      // Exact match
      if (existingNorm === extractedNorm) {
        bestMatch = existing;
        bestOverlap = 1.0;
        break;
      }

      // Word overlap
      const existingWords = wordSet(existing.title);
      const intersection = [...extractedWords].filter(w => existingWords.has(w)).length;
      const minWords = Math.min(extractedWords.size, existingWords.size) || 1;
      const overlap = intersection / minWords;

      if (overlap >= 0.6 && overlap > bestOverlap) {
        bestMatch = existing;
        bestOverlap = overlap;
      }
    }

    if (!bestMatch) return 'New';

    // Compare data fields
    const eL = parseInt(extractedRisk.likelihood);
    const eI = parseInt(extractedRisk.impact);
    const bL = parseInt(bestMatch.likelihood);
    const bI = parseInt(bestMatch.impact);
    const bScore = parseInt(bestMatch.residualScore);
    const eScore = eL && eI ? eL * eI : null;

    // Conflict: significant score or rating contradiction
    if (eScore !== null && bScore) {
      if (Math.abs(eScore - bScore) > 3) return 'Conflict';
    }
    if (!isNaN(eL) && !isNaN(bL) && Math.abs(eL - bL) >= 2) return 'Conflict';
    if (!isNaN(eI) && !isNaN(bI) && Math.abs(eI - bI) >= 2) return 'Conflict';

    // Duplicate: title, category, and score all match closely
    const sameCategory = !extractedRisk.category ||
      normalize(extractedRisk.category) === normalize(bestMatch.category);
    const sameScore = !eScore || !bScore || Math.abs(eScore - bScore) <= 1;

    if (bestOverlap >= 0.85 && sameCategory && sameScore) return 'Duplicate';

    return 'Update';
  }

  /**
   * Run delta detection on all extracted items in the result.
   * Adds deltaStatus field to each risk. Controls/Policies/Actions default to 'New'.
   */
  static applyDeltaToExtraction(extraction, existingRisks) {
    if (!extraction) return extraction;

    const withDelta = { ...extraction };

    withDelta.extracted_risks = (extraction.extracted_risks || []).map(risk => ({
      ...risk,
      id: `ext-risk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      deltaStatus: this.computeDeltaStatus(risk, existingRisks)
    }));

    withDelta.extracted_controls = (extraction.extracted_controls || []).map(ctrl => ({
      ...ctrl,
      id: `ext-ctrl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      deltaStatus: 'New'
    }));

    withDelta.extracted_policies = (extraction.extracted_policies || []).map(pol => ({
      ...pol,
      id: `ext-pol-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      deltaStatus: 'New'
    }));

    withDelta.extracted_actions = (extraction.extracted_actions || []).map(act => ({
      ...act,
      id: `ext-act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      deltaStatus: 'New'
    }));

    withDelta.gaps_detected = (extraction.gaps_detected || []).map((gap, i) => ({
      id: `ext-gap-${Date.now()}-${i}`,
      description: gap,
      deltaStatus: 'New',
      confidence: 'medium'
    }));

    return withDelta;
  }

  // ─── APPLY ACCEPTED ITEMS TO REGISTER ────────────────────────────────────

  /**
   * Convert an accepted extracted risk into a StorageService-compatible risk object.
   */
  static extractedRiskToRegisterRisk(extractedRisk) {
    const likelihood = parseInt(extractedRisk.likelihood) || 3;
    const impact = parseInt(extractedRisk.impact) || 3;
    return {
      id: `risk-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 4)}`,
      title: extractedRisk.title || 'Unnamed Risk',
      description: extractedRisk.description || '',
      category: extractedRisk.category || 'Operational',
      owner: extractedRisk.owner || '',
      likelihood,
      impact,
      likelihoodResidual: likelihood,
      impactResidual: impact,
      velocity: 3,
      velocityResidual: 2,
      trend: 'Stable',
      source: 'Imported via Risk Intelligence Desk'
    };
  }
}
