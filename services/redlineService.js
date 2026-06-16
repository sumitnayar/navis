// Navis Redline Service
// Compares old and new policy text to detect additions, deletions, and modifications.
// Provides side-by-side, inline redline, and semantic summaries.

import { AIService } from './aiService.js';

export class RedlineService {
  // LCS Word-level Diff Engine
  static diffWords(oldStr, newStr) {
    if (!oldStr) oldStr = "";
    if (!newStr) newStr = "";

    // Split text by words and space boundaries
    const oldWords = oldStr.split(/(\s+)/).filter(Boolean);
    const newWords = newStr.split(/(\s+)/).filter(Boolean);
    
    // LCS Table
    const dp = Array(oldWords.length + 1).fill(null).map(() => Array(newWords.length + 1).fill(0));
    
    for (let i = 1; i <= oldWords.length; i++) {
      for (let j = 1; j <= newWords.length; j++) {
        if (oldWords[i-1] === newWords[j-1]) {
          dp[i][j] = dp[i-1][j-1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
        }
      }
    }
    
    // Backtrack to build diff tokens
    let i = oldWords.length;
    let j = newWords.length;
    const tokens = [];
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && oldWords[i-1] === newWords[j-1]) {
        tokens.push({ type: 'equal', value: oldWords[i-1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
        tokens.push({ type: 'added', value: newWords[j-1] });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j-1] < dp[i-1][j])) {
        tokens.push({ type: 'removed', value: oldWords[i-1] });
        i--;
      }
    }
    
    const rawDiff = tokens.reverse();
    
    // Post-process adjacent removed + added tokens to mark them as 'modified'
    const merged = [];
    let idx = 0;
    while (idx < rawDiff.length) {
      if (rawDiff[idx].type === 'removed') {
        // Look ahead for sequential removals
        let nextIdx = idx;
        let removedVals = [];
        let addedVals = [];
        
        while (nextIdx < rawDiff.length && rawDiff[nextIdx].type === 'removed') {
          removedVals.push(rawDiff[nextIdx].value);
          nextIdx++;
        }
        
        // Then look ahead for sequential additions immediately following
        let hasAdded = false;
        while (nextIdx < rawDiff.length && rawDiff[nextIdx].type === 'added') {
          addedVals.push(rawDiff[nextIdx].value);
          nextIdx++;
          hasAdded = true;
        }
        
        if (hasAdded) {
          // Combine into a single modification token
          merged.push({
            type: 'modified',
            oldValue: removedVals.join(''),
            newValue: addedVals.join('')
          });
          idx = nextIdx;
        } else {
          merged.push(rawDiff[idx]);
          idx++;
        }
      } else {
        merged.push(rawDiff[idx]);
        idx++;
      }
    }
    
    return merged;
  }

  // Generate Inline Redline HTML markup
  static renderInlineRedline(oldStr, newStr) {
    const diff = this.diffWords(oldStr, newStr);
    
    return diff.map(t => {
      if (t.type === 'equal') {
        return escapeHtml(t.value);
      } else if (t.type === 'added') {
        return `<span style="background-color: #DEF7EC; color: #03543F; font-weight: 500; border-radius: 2px; padding: 0 2px;">${escapeHtml(t.value)}</span>`;
      } else if (t.type === 'removed') {
        return `<span style="background-color: #FDE8E8; color: #9B1C1C; text-decoration: line-through; border-radius: 2px; padding: 0 2px;">${escapeHtml(t.value)}</span>`;
      } else if (t.type === 'modified') {
        return `<span style="background-color: #FEF3C7; color: #92400E; border-bottom: 2px dotted #FCD34D; cursor: help; border-radius: 2px; padding: 0 2px;" title="Was: ${escapeHtml(t.oldValue).trim()}">${escapeHtml(t.newValue)}</span>`;
      }
      return "";
    }).join("");
  }

  // Generate Side-by-Side View grid blocks
  static renderSideBySide(oldStr, newStr) {
    if (!oldStr) oldStr = "";
    if (!newStr) newStr = "";

    const oldLines = oldStr.split('\n');
    const newLines = newStr.split('\n');
    const maxLines = Math.max(oldLines.length, newLines.length);

    let leftHtml = "";
    let rightHtml = "";

    for (let l = 0; l < maxLines; l++) {
      const oLine = oldLines[l] || "";
      const nLine = newLines[l] || "";

      if (oLine === nLine) {
        leftHtml += `<div class="diff-line">${escapeHtml(oLine) || "&nbsp;"}</div>`;
        rightHtml += `<div class="diff-line">${escapeHtml(nLine) || "&nbsp;"}</div>`;
      } else if (oLine && !nLine) {
        // Deleted line
        leftHtml += `<div class="diff-line removed-line" style="background-color: #FDE8E8; color: #9B1C1C; text-decoration: line-through;">${escapeHtml(oLine)}</div>`;
        rightHtml += `<div class="diff-line empty-line" style="background-color: #F8FAFC;">&nbsp;</div>`;
      } else if (!oLine && nLine) {
        // Added line
        leftHtml += `<div class="diff-line empty-line" style="background-color: #F8FAFC;">&nbsp;</div>`;
        rightHtml += `<div class="diff-line added-line" style="background-color: #DEF7EC; color: #03543F; font-weight: 500;">${escapeHtml(nLine)}</div>`;
      } else {
        // Modified line
        leftHtml += `<div class="diff-line modified-line-old" style="background-color: #FDF2F2; color: #9B1C1C;">${escapeHtml(oLine)}</div>`;
        rightHtml += `<div class="diff-line modified-line-new" style="background-color: #FEF3C7; color: #92400E;">${escapeHtml(nLine)}</div>`;
      }
    }

    return { leftHtml, rightHtml };
  }

  // Generate JSON Summary of Changes
  static async generateChangeSummary(oldStr, newStr, apiKey = '') {
    if (!oldStr) oldStr = "";
    if (!newStr) newStr = "";

    if (apiKey) {
      try {
        const prompt = `You are a professional legal compliance and policy reviewer.
Compare the baseline policy text with the proposed revised text.
Identify:
1. All significant clause additions.
2. All significant clause deletions/removals.
3. All wording modifications.
4. An executive summary statement.

Return ONLY a valid JSON object matching this schema:
{
  "additions": ["Description of addition 1", ...],
  "deletions": ["Description of deletion 1", ...],
  "modifications": ["Description of modification 1", ...],
  "executiveSummary": ["A concise summary sentence describing the scope of this update."]
}

Baseline Text:
\"\"\"
${oldStr.substring(0, 4000)}
\"\"\"

Proposed Text:
\"\"\"
${newStr.substring(0, 4000)}
\"\"\"`;

        const response = await AIService.queryGemini(prompt, apiKey);
        const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (err) {
        console.warn("AI change summary failed, falling back to local diff analysis", err);
      }
    }

    // Local Fallback analysis: parse tokens to compile basic lists
    const diff = this.diffWords(oldStr, newStr);
    const additions = [];
    const deletions = [];
    const modifications = [];

    diff.forEach(t => {
      if (t.type === 'added' && t.value.trim().length > 15) {
        const desc = t.value.trim().substring(0, 60) + "...";
        if (!additions.includes(desc)) additions.push(`Added: "${desc}"`);
      } else if (t.type === 'removed' && t.value.trim().length > 15) {
        const desc = t.value.trim().substring(0, 60) + "...";
        if (!deletions.includes(desc)) deletions.push(`Removed: "${desc}"`);
      } else if (t.type === 'modified' && t.newValue.trim().length > 10) {
        const desc = t.newValue.trim().substring(0, 50) + "...";
        if (!modifications.includes(desc)) modifications.push(`Modified to: "${desc}"`);
      }
    });

    // Truncate list sizes
    const cleanList = (arr) => arr.slice(0, 4);

    return {
      additions: cleanList(additions),
      deletions: cleanList(deletions),
      modifications: cleanList(modifications),
      executiveSummary: ["Draft comparison complete. Local diff detected adjustments in operational provisions."]
    };
  }
}

function escapeHtml(string) {
  const matchHtmlRegExp = /["'&<>]/;
  const str = '' + string;
  const match = matchHtmlRegExp.exec(str);

  if (!match) {
    return str;
  }

  let escape;
  let html = '';
  let index = 0;
  let lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 39: // '
        escape = '&#39;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index
    ? html + str.substring(lastIndex, index)
    : html;
}
