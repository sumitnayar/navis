// Board Questions & Answers Assistant Component - The Boardroom Chat Copilot

import { AIService } from '../services/aiService.js';

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
    // Preset Boardroom questions
    const presets = [
      { id: 'q-1', text: "What are our biggest risks and above appetite items?" },
      { id: 'q-2', text: "Which risks are worsening and improving this month?" },
      { id: 'q-3', text: "What threatens our company growth and revenue objectives?" },
      { id: 'q-4', text: "Which risks are interconnected and depend on each other?" },
      { id: 'q-5', text: "Which KRIs are breached and what actions are overdue?" }
    ];

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="profile-role-badge">AI Boardroom Assistant</span>
          <h1>Board Questions Portal</h1>
          <p class="page-subtitle">Obtain instant strategic risk assessments on appetite boundaries, trends, and cascades.</p>
        </div>
      </div>

      <div class="board-qa-layout">
        
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
            <p style="font-size:10px;color:var(--text-muted);margin-top:auto;text-align:center;line-height:1.3;">
              *AI answers compile active, live parameters from your risk ledger dynamically.
            </p>
          </div>
        </div>

        <!-- RIGHT: CHAT PORTAL -->
        <div class="chat-window">
          <div class="chat-header">
            <span class="chat-header-dot"></span>
            <div style="font-family:var(--font-header);font-weight:600;font-size:13px;color:var(--text-primary);">
              RiskOS Director Copilot
            </div>
          </div>

          <!-- MESSAGE SCROLLER -->
          <div class="chat-messages" id="chat-messages-container">
            ${this.messages.map(m => `
              <div class="chat-bubble ${m.sender === 'bot' ? 'bot' : 'user'}">
                ${m.sender === 'bot' ? this.formatMarkdown(m.text) : m.text}
              </div>
            `).join('')}

            ${this.isThinking ? `
              <div class="chat-bubble bot">
                <div class="chat-bubble-loader">
                  <span></span><span></span><span></span>
                </div>
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
  }

  async handleQuery(questionId, customText, container) {
    if (this.isThinking) return;

    let queryText = customText;
    if (questionId) {
      const presetsMap = {
        'q-1': "What are our biggest risks and above appetite items?",
        'q-2': "Which risks are worsening and improving this month?",
        'q-3': "What threatens our company growth and revenue objectives?",
        'q-4': "Which risks are interconnected and depend on each other?",
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
      this.messages.push({ sender: 'bot', text: "### **System Alert**\nFailed to compile dynamic analysis. Please check your internet connection or try again." });
    } finally {
      this.isThinking = false;
      this.render(container); // Final re-render
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
