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
        text: `### **Welcome, Director.** 
I have compiled active context across all **${this.state.risks.length} active risks** in the registry. 

Select a quick query or ask custom questions below to assess our risk posture.`
      }
    ];
  }

  // Fast Markdown formatter
  formatMarkdown(text) {
    if (!text) return "";
    let html = text;
    // Replace headings
    html = html.replace(/^### (.*$)/gim, '<h4 style="font-size:14px;font-weight:600;color:var(--text-primary);margin-top:12px;margin-bottom:6px;">$1</h4>');
    html = html.replace(/^#### (.*$)/gim, '<h5 style="font-size:12px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-top:10px;margin-bottom:4px;">$1</h5>');
    // Replace bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    // Replace horizontal rules
    html = html.replace(/^---$/gim, '<hr style="border:0;height:1px;background:var(--border-color);margin:12px 0;" />');
    // Replace lists
    html = html.replace(/^\* (.*$)/gim, '<li style="margin-left:16px;margin-bottom:4px;">$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li style="margin-left:16px;margin-bottom:4px;">$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li style="margin-left:16px;margin-bottom:4px;list-style:decimal;">$1</li>');
    
    return html;
  }

  render(container) {
    const settings = this.state.settings;
    const presets = [
      { id: 'q-1', text: "Which risks are above appetite?" },
      { id: 'q-2', text: "Which risks are worsening?" },
      { id: 'q-3', text: "What threatens growth objectives?" },
      { id: 'q-4', text: "Which risks are interconnected?" },
      { id: 'q-5', text: "What actions are overdue?" }
    ];

    container.innerHTML = `
      <style>
        .perplexity-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 32px;
          height: 600px;
          font-family: 'Inter', sans-serif;
          margin-top: 10px;
        }
        .perplexity-sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
          border-right: 1px solid var(--border-color);
          padding-right: 24px;
        }
        .perplexity-presets-title {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .preset-pill {
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background: #FFFFFF;
          color: var(--text-primary);
          font-size: 12.5px;
          cursor: pointer;
          margin-bottom: 6px;
          transition: all 0.15s ease;
          text-align: left;
        }
        .preset-pill:hover, .preset-pill.active {
          border-color: var(--color-indigo);
          background: var(--color-indigo-light);
          color: var(--color-indigo);
        }
        .flat-action-btn {
          border: 1px solid var(--border-color);
          background: #FFFFFF;
          color: var(--text-primary);
          padding: 8px 12px;
          font-weight: 500;
          font-size: 11px;
          border-radius: 6px;
          cursor: pointer;
          width: 100%;
          text-align: center;
          transition: all 0.15s ease;
        }
        .flat-action-btn:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-emphasis);
        }
        .claude-chat-window {
          display: flex;
          flex-direction: column;
          background: #FFFFFF;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          overflow: hidden;
        }
        .claude-chat-header {
          padding: 14px 20px;
          border-bottom: 1px solid var(--border-color);
          background: #F8FAFC;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .claude-chat-scroller {
          flex-grow: 1;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: #FFFFFF;
        }
        .claude-msg-row {
          display: flex;
          flex-direction: column;
          max-width: 85%;
        }
        .claude-msg-row.user {
          align-self: flex-end;
          align-items: flex-end;
        }
        .claude-msg-row.bot {
          align-self: flex-start;
          align-items: flex-start;
        }
        .claude-msg-bubble {
          padding: 12px 16px;
          border-radius: 8px;
          line-height: 1.5;
          font-size: 13px;
        }
        .claude-msg-row.user .claude-msg-bubble {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }
        .claude-msg-row.bot .claude-msg-bubble {
          background: #FFFFFF;
          color: var(--text-primary);
          border: none;
          padding-left: 0;
          padding-right: 0;
        }
        .claude-msg-label {
          font-size: 9px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          margin-bottom: 4px;
          letter-spacing: 0.05em;
        }
        .claude-input-bar {
          display: flex;
          padding: 16px 20px;
          border-top: 1px solid var(--border-color);
          background: #F8FAFC;
          gap: 12px;
          align-items: center;
        }
        .claude-input-field {
          flex-grow: 1;
          height: 38px;
          border-radius: 20px !important;
          border: 1px solid var(--border-color) !important;
          padding: 0 16px !important;
          font-size: 13px !important;
          background: #FFFFFF !important;
        }
        .claude-input-field:focus {
          border-color: var(--color-indigo) !important;
        }
        .claude-send-btn {
          height: 38px;
          border-radius: 20px !important;
          padding: 0 20px !important;
          font-weight: 600;
          font-size: 13px;
          background: var(--color-indigo) !important;
          color: #FFFFFF !important;
          border: none;
          cursor: pointer;
        }
      </style>

      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">AI Assistant</span>
          <h1>Ask Navis</h1>
        </div>
      </div>

      <div class="perplexity-layout">
        
        <!-- LEFT: QUIET PRESSETS -->
        <div class="perplexity-sidebar no-print">
          <div>
            <div class="perplexity-presets-title">Suggested Queries</div>
            <div style="display:flex; flex-direction:column;">
              ${presets.map(p => `
                <button class="preset-pill ${this.activeQuestionId === p.id ? 'active' : ''}" data-id="${p.id}">
                  ${p.text}
                </button>
              `).join('')}
            </div>
          </div>

          <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: auto;">
            <button class="flat-action-btn" id="btn-generate-intel-profile" ${this.isThinking ? 'disabled' : ''}>
              Generate Context Profile
            </button>
          </div>
        </div>

        <!-- RIGHT: CLAUDE STYLE CHAT VIEW -->
        <div class="claude-chat-window">
          
          <div class="claude-chat-header">
            <span style="font-weight: 600; font-size: 13px; color: var(--color-navy);">Navis Copilot</span>
            <span class="status-badge within" style="font-size: 9px; padding: 2px 6px; text-transform: uppercase;">
              Active
            </span>
          </div>

          <!-- SCROLLER -->
          <div class="claude-chat-scroller" id="chat-messages-container">
            ${this.messages.map(m => `
              <div class="claude-msg-row ${m.sender === 'bot' ? 'bot' : 'user'}">
                <span class="claude-msg-label">${m.sender === 'bot' ? 'Navis' : 'Director'}</span>
                <div class="claude-msg-bubble">
                  ${m.sender === 'bot' ? this.formatMarkdown(m.text) : m.text}
                </div>
              </div>
            `).join('')}

            ${this.isThinking ? `
              <div class="claude-msg-row bot">
                <span class="claude-msg-label">Navis</span>
                <div class="claude-msg-bubble" style="display:flex; align-items:center; gap:8px; color: var(--text-secondary);">
                  <div class="chat-bubble-loader" style="margin:0;">
                    <span></span><span></span><span></span>
                  </div>
                  <span>Analyzing risk ledger...</span>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- INPUT -->
          <div class="claude-input-bar no-print">
            <input type="text" class="claude-input-field form-control" id="chat-input-field" 
                   placeholder="Ask a custom question..." ${this.isThinking ? 'disabled' : ''} />
            <button class="claude-send-btn btn btn-primary" id="btn-chat-send" ${this.isThinking ? 'disabled' : ''}>
              Send
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
        'q-2': "Which risks are worsening?",
        'q-3': "What threatens growth objectives?",
        'q-4': "Which risks are interconnected?",
        'q-5': "What actions are overdue?"
      };
      queryText = presetsMap[questionId] || "";
      this.activeQuestionId = questionId;
    } else {
      this.activeQuestionId = null;
    }

    if (!queryText.trim()) return;

    this.messages.push({ sender: 'user', text: queryText });
    this.isThinking = true;
    this.render(container);

    try {
      const answer = await AIService.answerBoardQuestion(
        questionId, 
        queryText, 
        this.state.risks, 
        this.state.settings
      );
      this.messages.push({ sender: 'bot', text: answer });
    } catch (e) {
      this.messages.push({ 
        sender: 'bot', 
        text: `Intelligence layer temporarily offline. Displaying cached registry stats.` 
      });
    } finally {
      this.isThinking = false;
      this.render(container);
    }
  }

  async handleGenerateProfile(container) {
    if (this.isThinking) return;

    this.messages.push({ sender: 'user', text: "Generate Boardroom Risk Intelligence Context Profile" });
    this.isThinking = true;
    this.render(container);

    try {
      const context = await RiskIntelligenceContextService.buildContext();
      const profile = await AIService.generateRiskIntelligenceProfile(context, this.state.settings);
      this.messages.push({ sender: 'bot', text: profile });
    } catch (e) {
      console.error("Profile generation failed:", e);
      this.messages.push({ 
        sender: 'bot', 
        text: `Unable to compile context profile. Verification in progress.` 
      });
    } finally {
      this.isThinking = false;
      this.render(container);
    }
  }

  bindEvents(container) {
    const presetButtons = container.querySelectorAll('.preset-pill');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        this.handleQuery(id, null, container);
      });
    });

    const genIntelBtn = container.querySelector('#btn-generate-intel-profile');
    if (genIntelBtn) {
      genIntelBtn.addEventListener('click', () => {
        this.handleGenerateProfile(container);
      });
    }

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
