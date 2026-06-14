// Board Questions & Answers Assistant Component - The Boardroom Chat Copilot

import { AIService } from '../services/aiService.js';
import { RiskIntelligenceContextService } from '../services/riskIntelligenceContextService.js';

export class BoardQAComponent {
  constructor(appState, onStateChange) {
    this.state = appState;
    this.onStateChange = onStateChange;
    this.activeQuestionId = null;
    this.isThinking = false;
    this.messages = [
      {
        sender: 'bot',
        text: `### **Good morning, Director.** 
Welcome to your Board Risk Intelligence Assistant. I have analyzed all **${this.state.risks.length} active risk elements** in your register. 

Please select one of the core board questions on the left, or type a custom query below to obtain a strategic assessment of your risk posture in under five seconds.`
      }
    ];
  }

  // Fast Markdown formatter
  formatMarkdown(text) {
    if (!text) return "";
    let html = text;
    // Replace headings
    html = html.replace(/^### (.*$)/gim, '<h4 style="font-size:13px;font-weight:700;color:var(--text-primary);margin-top:10px;margin-bottom:6px;">$1</h4>');
    html = html.replace(/^#### (.*$)/gim, '<h5 style="font-size:11px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-top:8px;margin-bottom:4px;">$1</h5>');
    // Replace bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    // Replace horizontal rules
    html = html.replace(/^---$/gim, '<hr style="border:0;height:1px;background:var(--border-color);margin:8px 0;" />');
    // Replace lists
    html = html.replace(/^\* (.*$)/gim, '<li style="margin-left:12px;margin-bottom:3px;">$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li style="margin-left:12px;margin-bottom:3px;">$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li style="margin-left:12px;margin-bottom:3px;list-style:decimal;">$1</li>');
    
    return html;
  }

  render(container) {
    const settings = this.state.settings;
    const isApiConnected = Boolean(settings.geminiApiKey || this.state.serverGeminiConfigured);

    // Preset Boardroom questions
    const presets = [
      { id: 'q-1', text: "Which risks are above appetite?" },
      { id: 'q-2', text: "Which risks are worsening and improving?" },
      { id: 'q-3', text: "What threatens our growth and revenue objectives?" },
      { id: 'q-4', text: "Which risks are interconnected?" },
      { id: 'q-5', text: "Which KRIs are breached and what actions are overdue?" }
    ];

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">AI Boardroom Assistant</span>
          <h1>Ask Navis</h1>
          <p class="page-subtitle">Ask boardroom questions across risks, objectives, policies, and controls.</p>
        </div>
      </div>

      <div class="board-qa-layout" style="display: grid; grid-template-columns: 35% 65%; gap: 20px; height: 580px;">
        
        <!-- LEFT: PRESET QUICK DIRECTIVES -->
        <div class="details-panel no-print">
          <div class="glass-panel" style="height:100%;display:flex;flex-direction:column;gap:12px;">
            <h4 style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Director Quick-Click Queries</h4>
            <div class="preset-question-list">
              ${presets.map(p => `
                <div class="preset-question-card ${this.activeQuestionId === p.id ? 'active' : ''}" 
                     data-id="${p.id}">
                  ${p.text}
                </div>
              `).join('')}
            </div>

            <!-- PREMIUM PROFILE GENERATOR CARD -->
            <div class="glass-panel risk-intel-card" style="border: 1px solid rgba(139, 92, 246, 0.25); background: linear-gradient(135deg, rgba(88, 28, 135, 0.1) 0%, rgba(15, 23, 42, 0.4) 100%); margin-top: 8px; padding: 14px; border-radius: 10px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 4px 16px rgba(139, 92, 246, 0.1);">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 14px;">🌐</span>
                <span style="font-family: var(--font-header); font-size: 10px; font-weight: 700; color: #a78bfa; letter-spacing: 0.5px; text-transform: uppercase;">Risk Network Engine</span>
              </div>
              <h3 style="font-family: var(--font-header); font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 0; line-height: 1.2;">Boardroom Intelligence Profiler</h3>
              <p style="font-size: 10px; color: var(--text-secondary); line-height: 1.3; margin: 0;">Assemble structural fragility, influence metrics, stale review logs, and 90-day board directives.</p>
              <button class="btn btn-primary" id="btn-generate-intel-profile" style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); border: none; color: white; padding: 8px 12px; font-weight: 600; font-size: 10px; border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; width: 100%; box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);" ${this.isThinking ? 'disabled' : ''}>
                ⚡ Generate Risk Profile
              </button>
            </div>

            <p style="font-size:10px;color:var(--text-muted);margin-top:auto;text-align:center;line-height:1.3;">
              *AI answers compile active, live parameters from your risk ledger dynamically.
            </p>
          </div>
        </div>

        <!-- RIGHT: CHAT PORTAL -->
        <div class="chat-window">
          <div class="chat-header" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); background: #FFFFFF;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="pulsing-green-dot" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: var(--color-safe); box-shadow: 0 0 0 rgba(29, 158, 117, 0.4); animation: pulseGreen 1.5s infinite;"></span>
              <style>
                @keyframes pulseGreen {
                  0% {
                    box-shadow: 0 0 0 0 rgba(29, 158, 117, 0.7);
                  }
                  70% {
                    box-shadow: 0 0 0 6px rgba(29, 158, 117, 0);
                  }
                  100% {
                    box-shadow: 0 0 0 0 rgba(29, 158, 117, 0);
                  }
                }
              </style>
              <span style="font-family: var(--font-header); font-weight: 600; font-size: 13px; color: var(--color-navy);">Navis Director Copilot</span>
            </div>
            <span class="status-badge" style="font-size: 9px; padding: 3px 8px; border-radius: 4px; background-color: #E6F7F4; color: #0F6E56; font-weight: 600; text-transform: uppercase;">
              AI Engine Active
            </span>
          </div>

          <!-- MESSAGE SCROLLER -->
          <div class="chat-messages" id="chat-messages-container">
            ${this.messages.map(m => `
              <div class="chat-bubble ${m.sender === 'bot' ? 'bot' : 'user'}">
                ${m.sender === 'bot' ? this.formatMarkdown(m.text) : m.text}
              </div>
            `).join('')}

            ${this.isThinking ? `
              <div class="chat-bubble bot" style="display:flex; align-items:center; gap:8px;">
                <style>
                  @keyframes boardQAPulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                  }
                </style>
                <div class="chat-bubble-loader" style="margin:0;">
                  <span></span><span></span><span></span>
                </div>
                <span style="font-size:11px;color:var(--text-secondary);font-family:var(--font-header);animation:boardQAPulse 1.5s infinite;">Analyzing ${this.state.risks.length} active risk elements...</span>
              </div>
            ` : ''}
          </div>

          <!-- INPUT FORM -->
          <div class="chat-input-bar no-print">
            <input type="text" class="form-control" id="chat-input-field" 
                   placeholder="Type a custom boardroom question... e.g. What threaten customer trust?" 
                   style="flex-grow:1;" ${this.isThinking ? 'disabled' : ''} />
            <button class="btn btn-primary" id="btn-chat-send" style="padding:10px 24px;" ${this.isThinking ? 'disabled' : ''}>
              Submit
            </button>
          </div>

        </div>

      </div>
    `;

    // Auto-scroll chat to bottom
    const scroller = container.querySelector('#chat-messages-container');
    if (scroller) {
      scroller.scrollTop = scroller.scrollHeight;
    }

    this.bindEvents(container);

    const prefillQuery = localStorage.getItem('navis_prefill_ask_query');
    if (prefillQuery) {
      localStorage.removeItem('navis_prefill_ask_query');
      setTimeout(() => {
        this.handleQuery(null, prefillQuery, container);
      }, 50);
    }
  }

  async handleQuery(questionId, customText, container) {
    if (this.isThinking) return;

    let queryText = customText;
    if (questionId) {
      const presetsMap = {
        'q-1': "Which risks are above appetite?",
        'q-2': "Which risks are worsening and improving?",
        'q-3': "What threatens our growth and revenue objectives?",
        'q-4': "Which risks are interconnected?",
        'q-5': "Which KRIs are breached and what actions are overdue?"
      };
      queryText = presetsMap[questionId] || "";
      this.activeQuestionId = questionId;
    } else {
      this.activeQuestionId = null;
    }

    if (!queryText.trim()) return;

    // 1. Add User Message
    this.messages.push({ sender: 'user', text: queryText });
    this.isThinking = true;
    this.render(container); // Re-render to show loader and scroll

    try {
      // 2. Query AI Analyst (Simulated or Live Gemini)
      const answer = await AIService.answerBoardQuestion(
        questionId, 
        queryText, 
        this.state.risks, 
        this.state.settings
      );

      // 3. Push Bot Answer
      this.messages.push({ sender: 'bot', text: answer });
    } catch (e) {
      this.messages.push({ 
        sender: 'bot', 
        text: `Intelligence layer temporarily unavailable. Displaying last cached analysis.\n\n*Error details: Failed to communicate with intelligence layer.*` 
      });
    } finally {
      this.isThinking = false;
      this.render(container); // Final re-render
    }
  }

  async handleGenerateProfile(container) {
    if (this.isThinking) return;

    this.messages.push({ sender: 'user', text: "Generate Boardroom Risk Intelligence Context Profile" });
    this.isThinking = true;
    this.render(container);

    try {
      // Build structured context object (zero DB schema change)
      const context = await RiskIntelligenceContextService.buildContext();

      // Query the upgraded Gemini engine
      const profile = await AIService.generateRiskIntelligenceProfile(context, this.state.settings);

      this.messages.push({ sender: 'bot', text: profile });
    } catch (e) {
      console.error("Profile generation failed:", e);
      this.messages.push({ 
        sender: 'bot', 
        text: `Intelligence layer temporarily unavailable. Displaying last cached analysis.\n\n*Error details: Failed to compile structural risk intelligence profile.*` 
      });
    } finally {
      this.isThinking = false;
      this.render(container);
    }
  }

  bindEvents(container) {
    // Preset cards click
    const presetCards = container.querySelectorAll('.preset-question-card');
    presetCards.forEach(c => {
      c.addEventListener('click', () => {
        const id = c.dataset.id;
        this.handleQuery(id, null, container);
      });
    });

    // Generate Intelligence Profile click
    const genIntelBtn = container.querySelector('#btn-generate-intel-profile');
    if (genIntelBtn) {
      genIntelBtn.addEventListener('click', () => {
        this.handleGenerateProfile(container);
      });
    }

    // Custom query send click
    const sendBtn = container.querySelector('#btn-chat-send');
    const inputField = container.querySelector('#chat-input-field');

    if (sendBtn && inputField) {
      sendBtn.addEventListener('click', () => {
        const text = inputField.value;
        if (text.trim()) {
          inputField.value = "";
          this.handleQuery(null, text, container);
        }
      });

      // Submit on Enter key
      inputField.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          const text = inputField.value;
          if (text.trim()) {
            inputField.value = "";
            this.handleQuery(null, text, container);
          }
        }
      });
    }
  }
}
