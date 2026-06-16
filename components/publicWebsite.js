const PAGE_METADATA = {
  '/': {
    title: 'Navis | AI-native governance and enterprise risk intelligence',
    description: 'Navis is an AI-native governance and enterprise risk intelligence platform for boards, leadership teams, risk professionals and growing organizations.'
  },
  '/product': {
    title: 'Product | Navis',
    description: 'Connect risks, policies, controls, objectives and scenarios in one AI-native governance intelligence layer.'
  },
  '/policy-studio': {
    title: 'Policy Intelligence Studio | Navis',
    description: 'Generate, upgrade, interrogate and govern policies using AI, with human approval at every step.'
  },
  '/board-decision-room': {
    title: 'Board Decision Room | Navis',
    description: 'Stress-test strategic events, compare management responses and make better board-level decisions.'
  },
  '/about': {
    title: 'About | Navis',
    description: 'Navis helps modern organizations navigate risk, strengthen governance and enable growth.'
  },
  '/request-demo': {
    title: 'Request a Private Demo | Navis',
    description: 'Request a private demonstration of the Navis governance and enterprise risk intelligence platform.'
  },
  '/contact': {
    title: 'Request a Private Demo | Navis',
    description: 'Request a private demonstration of the Navis governance and enterprise risk intelligence platform.'
  }
};

const pillarCards = [
  {
    index: '01',
    title: 'Board Risk Intelligence',
    copy: 'Turn live risk, control and action signals into a clear board-level view of enterprise exposure.'
  },
  {
    index: '02',
    title: 'Policy Intelligence Studio',
    copy: 'Create, improve and govern policy documents with AI-assisted clause and compliance intelligence.'
  },
  {
    index: '03',
    title: 'Board Decision Room',
    copy: 'Stress-test strategic events and compare response options before the pressure is real.'
  },
  {
    index: '04',
    title: 'Ask Navis',
    copy: 'Interrogate your governance environment and get decision-ready answers grounded in your data.'
  }
];

function routeLink(path, label, className = '') {
  return `<a class="${className}" href="${path}" data-public-route="${path}">${label}</a>`;
}

function renderPillars() {
  return `
    <section class="nw-band nw-band-ink">
      <div class="nw-container">
        <div class="nw-section-heading nw-section-heading-light">
          <span class="nw-eyebrow">One governance intelligence layer</span>
          <h2>From oversight to action.</h2>
          <p>Navis gives leaders a connected operating view of the decisions, evidence and exposures that shape enterprise resilience.</p>
        </div>
        <div class="nw-pillar-grid">
          ${pillarCards.map((pillar) => `
            <article class="nw-pillar-card">
              <span class="nw-card-index">${pillar.index}</span>
              <h3>${pillar.title}</h3>
              <p>${pillar.copy}</p>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderPlatformSection() {
  return `
    <section class="nw-band">
      <div class="nw-container nw-split">
        <div class="nw-section-heading">
          <span class="nw-eyebrow">The Navis governance layer</span>
          <h2>Every decision has context.</h2>
          <p>Documents, risks, controls, objectives and scenarios are connected into one governance layer, so evidence stays close to the decisions it informs.</p>
          ${routeLink('/product', 'Explore the platform', 'nw-text-link')}
        </div>
        <div class="nw-connection-map" aria-label="Navis connected governance model">
          <div class="nw-map-orbit nw-map-orbit-one"></div>
          <div class="nw-map-orbit nw-map-orbit-two"></div>
          <div class="nw-map-core"><strong>Navis</strong><span>Governance layer</span></div>
          <span class="nw-map-node nw-node-docs">Documents</span>
          <span class="nw-map-node nw-node-risks">Risks</span>
          <span class="nw-map-node nw-node-controls">Controls</span>
          <span class="nw-map-node nw-node-objectives">Objectives</span>
          <span class="nw-map-node nw-node-scenarios">Scenarios</span>
        </div>
      </div>
    </section>
  `;
}

function renderPolicySection() {
  return `
    <section class="nw-band nw-band-soft">
      <div class="nw-container nw-feature-split">
        <div class="nw-product-visual nw-policy-visual">
          <div class="nw-visual-topline"><span>Policy Intelligence Studio</span><span class="nw-live-dot">Approval required</span></div>
          <div class="nw-policy-file">
            <div class="nw-policy-file-head"><strong>Data Protection Policy</strong><span>v3.2</span></div>
            <div class="nw-policy-score-row"><span>DPDP alignment</span><strong>94%</strong></div>
            <div class="nw-progress"><span style="width:94%"></span></div>
            <div class="nw-policy-clause"><span>12.4</span><p>Data principal rights and response workflow</p><b>Updated</b></div>
            <div class="nw-policy-clause"><span>14.1</span><p>Processor oversight and audit evidence</p><b>Review</b></div>
          </div>
        </div>
        <div class="nw-section-heading">
          <span class="nw-eyebrow">Policy Intelligence Studio</span>
          <h2>Policies that keep pace with the business.</h2>
          <p>Generate, upgrade, interrogate and govern policies using AI, with human approval at every step.</p>
          <ul class="nw-check-list">
            <li>Policy generation and structured upgrades</li>
            <li>DPDP, GDPR and ISO 27701 alignment</li>
            <li>Clause intelligence and version history</li>
            <li>Controlled change queue approval</li>
          </ul>
          ${routeLink('/policy-studio', 'Explore Policy Studio', 'nw-text-link')}
        </div>
      </div>
    </section>
  `;
}

function renderDecisionSection() {
  const events = ['Cyber incident', 'Customer churn', 'Executive resignation', 'Cloud outage', 'Regulatory action', 'Fundraising delay'];
  return `
    <section class="nw-band">
      <div class="nw-container nw-feature-split nw-feature-reverse">
        <div class="nw-section-heading">
          <span class="nw-eyebrow">Board Decision Room</span>
          <h2>Make the hard decisions before they become urgent.</h2>
          <p>Stress-test strategic events and compare management responses across financial, operational, regulatory and reputational consequences.</p>
          <div class="nw-event-chips">
            ${events.map((event) => `<span>${event}</span>`).join('')}
          </div>
          ${routeLink('/board-decision-room', 'Enter the Decision Room', 'nw-text-link')}
        </div>
        <div class="nw-product-visual nw-decision-visual">
          <div class="nw-visual-topline"><span>Response comparison</span><span>Cloud outage</span></div>
          <div class="nw-response-row"><span>Option A</span><strong>Activate failover</strong><b class="nw-score-good">82</b></div>
          <div class="nw-response-row"><span>Option B</span><strong>Managed recovery</strong><b class="nw-score-watch">64</b></div>
          <div class="nw-response-row"><span>Option C</span><strong>Customer containment</strong><b class="nw-score-risk">47</b></div>
          <div class="nw-decision-axis"><span>Speed</span><span>Cost</span><span>Confidence</span><span>Resilience</span></div>
        </div>
      </div>
    </section>
  `;
}

function renderPrivatePreview() {
  return `
    <section class="nw-preview-cta">
      <div class="nw-container">
        <span class="nw-eyebrow">Private preview</span>
        <h2>Navis is currently in private preview.</h2>
        <p>We are onboarding selected boards, founders, risk teams and governance leaders.</p>
        ${routeLink('/request-demo', 'Request Private Demo', 'nw-button nw-button-light')}
      </div>
    </section>
  `;
}

function renderHeroVisual() {
  return `
    <div class="nw-hero-console" aria-label="Navis board risk intelligence preview">
      <div class="nw-console-nav"><span class="nw-console-brand">NV</span><span>Board Risk Intelligence</span><b>Live</b></div>
      <div class="nw-console-grid">
        <div class="nw-console-summary">
          <span>Enterprise posture</span>
          <strong>Watch</strong>
          <p>3 exposures require board attention</p>
        </div>
        <div class="nw-console-metric"><span>Risk velocity</span><strong>+18%</strong><i class="nw-mini-bars"><b></b><b></b><b></b><b></b><b></b></i></div>
        <div class="nw-console-metric"><span>Control confidence</span><strong>82%</strong><i class="nw-donut"></i></div>
        <div class="nw-console-wide">
          <div class="nw-console-wide-head"><span>Strategic risk cascade</span><b>Board view</b></div>
          <div class="nw-risk-line"><span class="nw-severity nw-severity-high"></span><strong>Cloud concentration</strong><em>Above appetite</em><b>8.6</b></div>
          <div class="nw-risk-line"><span class="nw-severity nw-severity-med"></span><strong>Customer retention</strong><em>Monitor</em><b>6.4</b></div>
          <div class="nw-risk-line"><span class="nw-severity nw-severity-low"></span><strong>Privacy readiness</strong><em>Within appetite</em><b>3.2</b></div>
        </div>
      </div>
    </div>
  `;
}

function renderHeroScreenshot() {
  return `
    <figure class="nw-screenshot-frame nw-hero-screenshot">
      <div class="nw-screenshot-bar">
        <span></span><span></span><span></span>
        <strong>Strategic Cascade Visualizer</strong>
        <b>Live board view</b>
      </div>
      <img src="/assets/screenshots/navis-cascade-map.png" alt="Navis Strategic Cascade Visualizer showing connected enterprise risks and objectives" fetchpriority="high">
    </figure>
  `;
}

function renderProductEvidence() {
  return `
    <section class="nw-band nw-evidence-band">
      <div class="nw-container">
        <div class="nw-section-heading">
          <span class="nw-eyebrow">Inside Navis</span>
          <h2>Real intelligence, built for the moments that matter.</h2>
          <p>Move from enterprise posture to root-cause exposure and board-level answers without losing the evidence behind the decision.</p>
        </div>
        <div class="nw-evidence-grid">
          <article class="nw-evidence-feature">
            <div class="nw-evidence-copy">
              <span>Strategic fragility</span>
              <h3>See where enterprise value is most exposed.</h3>
              <p>Understand structural vulnerability across revenue, growth, customer trust, technology, people and valuation.</p>
            </div>
            <figure class="nw-screenshot-frame">
              <div class="nw-screenshot-bar"><span></span><span></span><span></span><strong>Board Risk Intelligence</strong></div>
              <img src="/assets/screenshots/navis-strategic-fragility.png" alt="Navis strategic fragility dashboard chart" loading="lazy">
            </figure>
          </article>
          <article class="nw-evidence-feature nw-evidence-feature-reverse">
            <figure class="nw-screenshot-frame">
              <div class="nw-screenshot-bar"><span></span><span></span><span></span><strong>Ask Navis</strong></div>
              <img src="/assets/screenshots/navis-ask.png" alt="Ask Navis boardroom intelligence interface" loading="lazy">
            </figure>
            <div class="nw-evidence-copy">
              <span>Ask Navis</span>
              <h3>Interrogate the live governance environment.</h3>
              <p>Ask boardroom questions, assemble connected risk profiles and move directly from signal to decision context.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  `;
}

function renderExperiencePreview() {
  return `
    <section class="nw-band nw-experience-band">
      <div class="nw-container">
        <div class="nw-section-heading">
          <span class="nw-eyebrow">Designed as one system</span>
          <h2>A coherent public and private Navis experience.</h2>
          <p>Clear enough for first-time visitors. Deep enough for leadership teams managing consequential decisions.</p>
        </div>
        <figure class="nw-screenshot-frame nw-site-preview">
          <div class="nw-screenshot-bar">
            <span></span><span></span><span></span>
            <strong>navisrisk.com</strong>
          </div>
          <img src="/assets/screenshots/navis-public-website.png" alt="Full Navis public corporate website" loading="lazy">
        </figure>
      </div>
    </section>
  `;
}

function renderMockupPlaceholder(type, title) {
  if (type === 'board-mode') {
    return `
      <div class="nw-mockup-placeholder nw-mockup-board">
        <div class="nw-mockup-header">
          <span class="nw-mockup-dot"></span>
          <span class="nw-mockup-dot"></span>
          <span class="nw-mockup-dot"></span>
          <span class="nw-mockup-title">${title}</span>
          <span class="nw-mockup-badge">LIVE POSTURE</span>
        </div>
        <div class="nw-mockup-body">
          <div class="nw-mockup-sidebar">
            <div class="nw-mockup-item active"></div>
            <div class="nw-mockup-item"></div>
            <div class="nw-mockup-item"></div>
          </div>
          <div class="nw-mockup-main">
            <div class="nw-mockup-stats-row">
              <div class="nw-mockup-stat-card">
                <span>Enterprise Posture</span>
                <strong>Elevated</strong>
              </div>
              <div class="nw-mockup-stat-card">
                <span>Confidence</span>
                <strong>82%</strong>
              </div>
              <div class="nw-mockup-stat-card">
                <span>Risks</span>
                <strong>14 Active</strong>
              </div>
            </div>
            <div class="nw-mockup-chart-placeholder">
              <div class="nw-mockup-bar" style="height: 60%"></div>
              <div class="nw-mockup-bar" style="height: 85%"></div>
              <div class="nw-mockup-bar" style="height: 40%"></div>
              <div class="nw-mockup-bar" style="height: 70%"></div>
              <div class="nw-mockup-bar" style="height: 50%"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  if (type === 'policy-studio') {
    return `
      <div class="nw-mockup-placeholder nw-mockup-policy">
        <div class="nw-mockup-header">
          <span class="nw-mockup-dot"></span>
          <span class="nw-mockup-dot"></span>
          <span class="nw-mockup-dot"></span>
          <span class="nw-mockup-title">${title}</span>
          <span class="nw-mockup-badge">POLICY DESK</span>
        </div>
        <div class="nw-mockup-body">
          <div class="nw-mockup-sidebar">
            <div class="nw-mockup-item"></div>
            <div class="nw-mockup-item active"></div>
          </div>
          <div class="nw-mockup-main">
            <div class="nw-mockup-doc-header">
              <strong>Data Protection Policy</strong>
              <span>v3.2 — Pending Approval</span>
            </div>
            <div class="nw-mockup-clause-list">
              <div class="nw-mockup-clause">
                <div class="nw-mockup-clause-num">12.4</div>
                <div class="nw-mockup-clause-text">Escalation of material privacy incidents to the CRO...</div>
                <div class="nw-mockup-clause-status active">APPROVED</div>
              </div>
              <div class="nw-mockup-clause">
                <div class="nw-mockup-clause-num">14.1</div>
                <div class="nw-mockup-clause-text">Processor audit frequency and evidence logs...</div>
                <div class="nw-mockup-clause-status pending">REVIEW</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  if (type === 'board-decision-room') {
    return `
      <div class="nw-mockup-placeholder nw-mockup-decision">
        <div class="nw-mockup-header">
          <span class="nw-mockup-dot"></span>
          <span class="nw-mockup-dot"></span>
          <span class="nw-mockup-dot"></span>
          <span class="nw-mockup-title">${title}</span>
          <span class="nw-mockup-badge">SIMULATION ACTIVE</span>
        </div>
        <div class="nw-mockup-body">
          <div class="nw-mockup-sidebar">
            <div class="nw-mockup-item"></div>
            <div class="nw-mockup-item active"></div>
          </div>
          <div class="nw-mockup-main">
            <div class="nw-mockup-scenario-header">
              <strong>Scenario: Critical Cloud Outage</strong>
              <span>Impact: Operational / Reputation</span>
            </div>
            <div class="nw-mockup-response-options">
              <div class="nw-mockup-option">
                <span>Option A: Immediate Failover</span>
                <div class="nw-mockup-bar-confidence" style="width: 82%">Confidence: 82%</div>
              </div>
              <div class="nw-mockup-option">
                <span>Option B: Managed Recovery</span>
                <div class="nw-mockup-bar-confidence" style="width: 64%">Confidence: 64%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  if (type === 'ask-navis') {
    return `
      <div class="nw-mockup-placeholder nw-mockup-ask">
        <div class="nw-mockup-header">
          <span class="nw-mockup-dot"></span>
          <span class="nw-mockup-dot"></span>
          <span class="nw-mockup-dot"></span>
          <span class="nw-mockup-title">${title}</span>
          <span class="nw-mockup-badge">AI CHAT</span>
        </div>
        <div class="nw-mockup-body">
          <div class="nw-mockup-chat">
            <div class="nw-mockup-message user">
              <p>Show me all policies and risks affected by a privacy breach.</p>
            </div>
            <div class="nw-mockup-message assistant">
              <p>Analyzing corporate governance model... Found:</p>
              <ul>
                <li>Policy: Data Privacy Policy (Clause 12.4)</li>
                <li>Risk: Regulatory compliance failure</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  return '';
}

function renderHeroSection(session) {
  const dashboardPath = session ? '/dashboard' : '/login';
  const dashboardLabel = session ? 'Open Dashboard' : 'Login';
  return `
    <section class="nw-hero">
      <div class="nw-container nw-hero-grid">
        <div class="nw-hero-copy">
          <span class="nw-eyebrow">AI-native governance intelligence</span>
          <h1>AI-native governance and risk intelligence for modern boards</h1>
          <p>Move beyond static risk registers into policy intelligence, board decision simulations, living governance and board-ready decision support.</p>
          <div class="nw-actions">
            ${routeLink('/request-demo', 'Request Demo', 'nw-button nw-button-primary')}
            ${routeLink(dashboardPath, dashboardLabel, 'nw-button nw-button-secondary')}
          </div>
          <div class="nw-trust-line"><span>Built for consequential decisions</span><span>Human approval by design</span><span>Private preview</span></div>
        </div>
        <div class="nw-hero-visual-container">
          <figure class="nw-screenshot-frame nw-hero-screenshot">
            <div class="nw-screenshot-bar">
              <span></span><span></span><span></span>
              <strong>Board Mode — Live Posture</strong>
            </div>
            <img src="/assets/screenshots/navis-board-mode.png" alt="Navis Board Risk Intelligence Console showing overall enterprise posture" onerror="this.style.display='none'; this.closest('.nw-hero-screenshot').classList.add('no-image');">
            <div class="nw-screenshot-fallback">
              ${renderMockupPlaceholder('board-mode', 'Board Risk Intelligence')}
            </div>
          </figure>
        </div>
      </div>
    </section>
  `;
}

function renderProblemSection() {
  return `
    <section class="nw-band nw-problem-band">
      <div class="nw-container nw-problem-grid">
        <div class="nw-section-heading">
          <span class="nw-eyebrow">The governance gap</span>
          <h2>Static governance cannot keep up with a changing business.</h2>
          <p>Most leadership teams have more data than ever, but still lack a coherent view of what matters, what changed and what decision comes next.</p>
        </div>
        <div class="nw-problem-list">
          <span><b>01</b>Risk registers become stale</span>
          <span><b>02</b>Policies are fragmented</span>
          <span><b>03</b>Board packs take too long</span>
          <span><b>04</b>Scenario planning is shallow</span>
          <span><b>05</b>Governance evidence lives across documents, spreadsheets and email</span>
        </div>
      </div>
    </section>
  `;
}

function renderProductPillarsSection() {
  const pillars = [
    {
      index: '01',
      title: 'Board Risk Intelligence',
      copy: 'Turn live risk, control and action signals into a clear board-level view of enterprise exposure.'
    },
    {
      index: '02',
      title: 'Policy Studio',
      copy: 'Generate, upgrade, interrogate and govern policies with human approval at every step.'
    },
    {
      index: '03',
      title: 'Board Decision Room',
      copy: 'Stress-test events, compare management responses and identify board decisions.'
    },
    {
      index: '04',
      title: 'Ask Navis',
      copy: 'Ask boardroom questions across risks, controls, objectives, policies and scenarios.'
    }
  ];

  return `
    <section class="nw-band nw-band-ink">
      <div class="nw-container">
        <div class="nw-section-heading nw-section-heading-light">
          <span class="nw-eyebrow">Core product pillars</span>
          <h2>Four pillars. One governance operating layer.</h2>
          <p>Navis integrates risk tracking, policy management, scenario simulations, and Q&A into a single platform.</p>
        </div>
        <div class="nw-pillar-grid">
          ${pillars.map((pillar) => `
            <article class="nw-pillar-card">
              <span class="nw-card-index">${pillar.index}</span>
              <h3>${pillar.title}</h3>
              <p>${pillar.copy}</p>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderInteractivePreviewSection() {
  return `
    <section class="nw-band nw-preview-section">
      <div class="nw-container">
        <div class="nw-section-heading nw-section-heading-centered">
          <span class="nw-eyebrow">See Navis in action</span>
          <h2>See Navis in action</h2>
          <p class="nw-section-subtitle">A quick walkthrough of how Navis connects risks, policies, scenarios and board decisions into one governance operating layer.</p>
        </div>

        <div class="nw-main-preview-card">
          <div class="nw-main-preview-media">
            <div class="nw-main-preview-frame">
              <img src="/assets/screenshots/navis-board-mode.png" alt="Navis Board Risk Intelligence Walkthrough" onerror="this.style.display='none'; this.closest('.nw-main-preview-frame').classList.add('no-image');">
              <div class="nw-screenshot-fallback">
                ${renderMockupPlaceholder('board-mode', 'Board Risk Intelligence')}
              </div>
              <button class="nw-play-overlay-btn" aria-label="Play video walkthrough" data-timestamp="0">
                <span class="nw-play-icon">▶</span>
              </button>
            </div>
          </div>
          <div class="nw-main-preview-info">
            <p class="nw-main-preview-caption">Understand enterprise posture, key risks, and strategic board decisions in real-time.</p>
            <button class="nw-button nw-button-primary nw-watch-walkthrough-btn" data-timestamp="0">Watch 2-minute walkthrough</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderVideoChaptersSection() {
  const chapters = [
    {
      timestamp: 0,
      timestampLabel: '0:00',
      title: 'Board Risk Intelligence',
      caption: 'Understand enterprise posture, top board issues and threatened objectives in seconds.',
      screenshot: '/assets/screenshots/navis-board-mode.png',
      mockupType: 'board-mode'
    },
    {
      timestamp: 30,
      timestampLabel: '0:30',
      title: 'AI Policy Generation and Governance',
      caption: 'Generate, upgrade, interrogate and govern policies with human approval at every step.',
      screenshot: '/assets/screenshots/navis-policy-studio.png',
      mockupType: 'policy-studio'
    },
    {
      timestamp: 75,
      timestampLabel: '1:15',
      title: 'Strategic Scenario Simulation',
      caption: 'Stress-test events, compare management responses and identify board decisions.',
      screenshot: '/assets/screenshots/navis-board-decision-room.png',
      mockupType: 'board-decision-room'
    },
    {
      timestamp: 120,
      timestampLabel: '2:00',
      title: 'Governance Q&A',
      caption: 'Ask boardroom questions across risks, controls, objectives, policies and scenarios.',
      screenshot: '/assets/screenshots/navis-ask-navis.png',
      mockupType: 'ask-navis'
    }
  ];

  return `
    <section class="nw-band nw-chapters-section">
      <div class="nw-container">
        <div class="nw-section-heading nw-section-heading-centered">
          <span class="nw-eyebrow">Walkthrough Chapters</span>
          <h2>Explore specific capabilities</h2>
          <p class="nw-section-subtitle">Select a chapter below to jump directly to that part of the product tour.</p>
        </div>
        <div class="nw-chapters-grid">
          ${chapters.map((chapter) => `
            <article class="nw-chapter-card" data-timestamp="${chapter.timestamp}">
              <div class="nw-chapter-media">
                <img src="${chapter.screenshot}" alt="${chapter.title}" onerror="this.style.display='none'; this.closest('.nw-chapter-media').classList.add('no-image');" loading="lazy">
                <div class="nw-screenshot-fallback">
                  ${renderMockupPlaceholder(chapter.mockupType, chapter.title)}
                </div>
                <div class="nw-chapter-overlay">
                  <span class="nw-chapter-play-icon">▶</span>
                </div>
              </div>
              <div class="nw-chapter-content">
                <span class="nw-chapter-time">${chapter.timestampLabel}</span>
                <h3>${chapter.title}</h3>
                <p>${chapter.caption}</p>
                <span class="nw-chapter-cta">Watch chapter <span class="nw-cta-arrow">&rarr;</span></span>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderWhoIsForSection() {
  const audiences = [
    ['Boards and Independent Directors', 'See the exposure, evidence and choices behind every material decision.'],
    ['CEOs and Founders', 'Connect strategic ambition to the risks and actions that shape execution.'],
    ['CROs and Risk Teams', 'Replace fragmented registers with a living enterprise risk system.'],
    ['Compliance and Privacy Teams', 'Govern policies, clauses and evidence through controlled workflows.'],
    ['Investors and Advisors', 'Understand resilience, readiness and decision quality with greater clarity.']
  ];

  return `
    <section class="nw-band nw-band-soft nw-audience-section">
      <div class="nw-container">
        <div class="nw-section-heading nw-section-heading-centered">
          <span class="nw-eyebrow">Who Navis is for</span>
          <h2>One shared intelligence layer. Five critical perspectives.</h2>
        </div>
        <div class="nw-audience-grid">
          ${audiences.map(([title, copy]) => `
            <article class="nw-audience-card">
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderHome(session) {
  return `
    <main>
      ${renderHeroSection(session)}
      ${renderProblemSection()}
      ${renderProductPillarsSection()}
      ${renderInteractivePreviewSection()}
      ${renderVideoChaptersSection()}
      ${renderWhoIsForSection()}
      ${renderPrivatePreview()}
    </main>
  `;
}

function renderProductPage() {
  return `
    <main>
      <section class="nw-page-hero">
        <div class="nw-container nw-page-hero-grid">
          <div>
            <span class="nw-eyebrow">The Navis platform</span>
            <h1>A connected operating layer for modern governance.</h1>
            <p>Bring together enterprise risk, policy intelligence, strategic objectives, controls, evidence and scenarios so leadership can move from visibility to decision.</p>
            <div class="nw-actions">${routeLink('/request-demo', 'Request Private Demo', 'nw-button nw-button-primary')}${routeLink('/login', 'Login', 'nw-button nw-button-secondary')}</div>
          </div>
          ${renderHeroVisual()}
        </div>
      </section>
      ${renderPillars()}
      ${renderPlatformSection()}
      <section class="nw-band nw-band-soft">
        <div class="nw-container">
          <div class="nw-section-heading"><span class="nw-eyebrow">A continuous intelligence cycle</span><h2>Sense. Connect. Decide. Govern.</h2></div>
          <div class="nw-cycle-grid">
            <article><span>01</span><h3>Sense</h3><p>Capture signals across risks, policies, controls, actions and evidence.</p></article>
            <article><span>02</span><h3>Connect</h3><p>Map what changed to the objectives, owners and obligations it affects.</p></article>
            <article><span>03</span><h3>Decide</h3><p>Compare options with board-ready context and scenario intelligence.</p></article>
            <article><span>04</span><h3>Govern</h3><p>Maintain accountability, approvals, evidence and a clear decision trail.</p></article>
          </div>
        </div>
      </section>
      ${renderPrivatePreview()}
    </main>
  `;
}

function renderPolicyPage() {
  return `
    <main>
      <section class="nw-page-hero nw-page-hero-policy">
        <div class="nw-container nw-page-hero-grid">
          <div>
            <span class="nw-eyebrow">Policy Intelligence Studio</span>
            <h1>Turn policy documents into governed intelligence.</h1>
            <p>Generate, upgrade, interrogate and govern policies using AI, with human approval at every step.</p>
            <div class="nw-actions">${routeLink('/request-demo', 'Request Private Demo', 'nw-button nw-button-primary')}${routeLink('/login', 'Open Dashboard', 'nw-button nw-button-secondary')}</div>
          </div>
          <div class="nw-policy-workbench">
            <div class="nw-workbench-nav"><strong>Change queue</strong><span>4 pending</span></div>
            <div class="nw-workbench-body">
              <div class="nw-workbench-doc"><span>Clause 8.2</span><h3>Privacy incident escalation</h3><p>Material incidents must be escalated to the privacy owner and executive risk committee.</p></div>
              <aside><span>Alignment</span><strong>DPDP Act</strong><strong>GDPR Art. 33</strong><strong>ISO 27701</strong><button type="button">Approve change</button></aside>
            </div>
          </div>
        </div>
      </section>
      <section class="nw-band">
        <div class="nw-container">
          <div class="nw-section-heading"><span class="nw-eyebrow">Built for accountable policy operations</span><h2>AI-assisted speed. Human-governed control.</h2></div>
          <div class="nw-feature-grid">
            ${[
              ['Generate', 'Create structured first drafts grounded in your organization, sector and obligations.'],
              ['Upgrade', 'Identify gaps, improve language and align existing documents to changing expectations.'],
              ['Interrogate', 'Ask precise questions and trace answers back to clauses, evidence and obligations.'],
              ['Govern', 'Control every change through version history, review queues and named approval.'],
              ['Align', 'Map policies against DPDP, GDPR and ISO 27701 requirements.'],
              ['Explain', 'Give leadership a clear view of policy posture, exceptions and pending decisions.']
            ].map(([title, copy]) => `<article><span></span><h3>${title}</h3><p>${copy}</p></article>`).join('')}
          </div>
        </div>
      </section>
      ${renderPolicySection()}
      ${renderPrivatePreview()}
    </main>
  `;
}

function renderDecisionPage() {
  const scenarios = [
    ['Cyber incident', 'Containment, disclosure and continuity under pressure.'],
    ['Customer churn', 'Commercial interventions and investment trade-offs.'],
    ['Key executive resignation', 'Succession, confidence and operating continuity.'],
    ['Cloud outage', 'Recovery choices across speed, cost and customer impact.'],
    ['Regulatory action', 'Response posture, remediation and reputation.'],
    ['Fundraising delay', 'Runway protection and strategic prioritization.']
  ];
  return `
    <main>
      <section class="nw-page-hero nw-page-hero-decision">
        <div class="nw-container nw-page-hero-grid">
          <div>
            <span class="nw-eyebrow">Board Decision Room</span>
            <h1>Stress-test strategic events and compare management responses.</h1>
            <p>Give boards and leadership teams a structured environment to test choices before events move faster than the organization.</p>
            <div class="nw-actions">${routeLink('/request-demo', 'Request Private Demo', 'nw-button nw-button-primary')}${routeLink('/login', 'Open Dashboard', 'nw-button nw-button-secondary')}</div>
          </div>
          <div class="nw-scenario-matrix">
            <div class="nw-matrix-head"><span>Strategic scenario</span><strong>Cloud outage</strong></div>
            <div class="nw-matrix-axis"><span>Response</span><span>Speed</span><span>Cost</span><span>Confidence</span></div>
            <div class="nw-matrix-row"><strong>Activate failover</strong><i class="high"></i><i class="med"></i><i class="high"></i></div>
            <div class="nw-matrix-row"><strong>Managed recovery</strong><i class="med"></i><i class="high"></i><i class="med"></i></div>
            <div class="nw-matrix-row"><strong>Contain customers</strong><i class="low"></i><i class="med"></i><i class="low"></i></div>
          </div>
        </div>
      </section>
      <section class="nw-band">
        <div class="nw-container">
          <div class="nw-section-heading"><span class="nw-eyebrow">Scenario library</span><h2>Prepare for the decisions that change trajectory.</h2><p>Explore plausible events through a consistent decision framework, grounded in your live risk and governance context.</p></div>
          <div class="nw-scenario-grid">${scenarios.map(([title, copy], index) => `<article><span>0${index + 1}</span><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div>
        </div>
      </section>
      ${renderDecisionSection()}
      ${renderPrivatePreview()}
    </main>
  `;
}

function renderAboutPage() {
  return `
    <main>
      <section class="nw-page-hero nw-about-hero">
        <div class="nw-container nw-about-grid">
          <div><span class="nw-eyebrow">About Navis</span><h1>Navigate Risk.<br>Enable Growth.</h1></div>
          <div><p>Navis exists to make governance a source of decision advantage, not an administrative burden.</p><p>We are building an AI-native intelligence layer that helps modern organizations see connected risk, improve policy quality, prepare for strategic events and give boards the context to act with confidence.</p></div>
        </div>
      </section>
      <section class="nw-band nw-band-ink">
        <div class="nw-container">
          <div class="nw-section-heading nw-section-heading-light"><span class="nw-eyebrow">What we believe</span><h2>Good governance should increase the quality and speed of decisions.</h2></div>
          <div class="nw-belief-grid">
            <article><span>01</span><h3>Intelligence over documentation</h3><p>Governance earns its place when it helps people understand what changed and choose what comes next.</p></article>
            <article><span>02</span><h3>Connected context over silos</h3><p>Risks, policies, controls, evidence and objectives are more useful when their relationships are visible.</p></article>
            <article><span>03</span><h3>Human judgment stays central</h3><p>AI can accelerate analysis and preparation. Accountability and approval remain human.</p></article>
          </div>
        </div>
      </section>
      ${renderPlatformSection()}
      ${renderPrivatePreview()}
    </main>
  `;
}

function renderDemoPage() {
  return `
    <main class="nw-demo-main">
      <section class="nw-demo-section">
        <div class="nw-container nw-demo-grid">
          <div class="nw-demo-copy">
            <span class="nw-eyebrow">Private preview</span>
            <h1>See how Navis turns governance into decision intelligence.</h1>
            <p>Tell us a little about your organization and the governance questions you are working through. We will tailor the conversation to your priorities.</p>
            <div class="nw-demo-notes">
              <span><b>01</b>Focused 45-minute platform walkthrough</span>
              <span><b>02</b>Your risk, policy and decision-use cases</span>
              <span><b>03</b>Private preview access discussion</span>
            </div>
          </div>
          <form id="nw-demo-form" class="nw-demo-form">
            <div class="nw-field-row">
              <label><span>Name</span><input name="name" type="text" autocomplete="name" required></label>
              <label><span>Work email</span><input name="email" type="email" autocomplete="email" required></label>
            </div>
            <div class="nw-field-row">
              <label><span>Company</span><input name="company" type="text" autocomplete="organization" required></label>
              <label><span>Role</span><input name="role" type="text" autocomplete="organization-title" required></label>
            </div>
            <label><span>Message</span><textarea name="message" rows="5" placeholder="What would you like to explore?"></textarea></label>
            <div id="nw-demo-status" class="nw-form-status is-hidden" role="status"></div>
            <button class="nw-button nw-button-primary" type="submit">Request Private Demo</button>
            <p class="nw-form-note">Your details will only be used to respond to this request.</p>
          </form>
        </div>
      </section>
    </main>
  `;
}

export class PublicWebsite {
  constructor(container, navigate) {
    this.container = container;
    this.navigate = navigate;
  }

  render(path, session) {
    const normalizedPath = path === '/contact' ? '/request-demo' : path;
    const metadata = PAGE_METADATA[path] || PAGE_METADATA[normalizedPath] || PAGE_METADATA['/'];
    document.title = metadata.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description);

    let content = renderHome(session);
    if (normalizedPath === '/product') content = renderProductPage();
    if (normalizedPath === '/policy-studio') content = renderPolicyPage();
    if (normalizedPath === '/board-decision-room') content = renderDecisionPage();
    if (normalizedPath === '/about') content = renderAboutPage();
    if (normalizedPath === '/request-demo') content = renderDemoPage();

    const accountPath = session ? '/dashboard' : '/login';
    const accountLabel = session ? 'Open Dashboard' : 'Login';

    this.container.innerHTML = `
      <div class="nw-site-shell">
        <header class="nw-header">
          <div class="nw-container nw-header-inner">
            ${routeLink('/', '<span class="nw-brand-mark">N</span><span class="nw-brand-word">NAVIS</span>', 'nw-brand')}
            <button class="nw-menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false"><span></span><span></span></button>
            <nav class="nw-main-nav" aria-label="Main navigation">
              ${routeLink('/product', 'Product')}
              ${routeLink('/policy-studio', 'Policy Studio')}
              ${routeLink('/board-decision-room', 'Decision Room')}
              ${routeLink('/about', 'About')}
            </nav>
            <div class="nw-header-actions">
              ${routeLink(accountPath, accountLabel, 'nw-login-link')}
              ${routeLink('/request-demo', 'Request Demo', 'nw-button nw-button-primary nw-button-small')}
            </div>
          </div>
        </header>
        ${content}
        <footer class="nw-footer">
          <div class="nw-container nw-footer-grid">
            <div class="nw-footer-brand">${routeLink('/', '<span class="nw-brand-mark">N</span><span class="nw-brand-word">NAVIS</span>', 'nw-brand')}<p>Navigate Risk. Enable Growth.</p></div>
            <div>
              <strong>Product</strong>
              ${routeLink('/product', 'Product')}
              ${routeLink('/policy-studio', 'Policy Studio')}
              ${routeLink('/board-decision-room', 'Board Decision Room')}
            </div>
            <div>
              <strong>Company</strong>
              ${routeLink('/about', 'About')}
              ${routeLink('/request-demo', 'Request Demo')}
              ${routeLink(accountPath, accountLabel)}
            </div>
            <div class="nw-footer-preview"><strong>Private preview</strong><p>AI-native governance intelligence for modern boards.</p></div>
          </div>
          <div class="nw-container nw-footer-bottom"><span>Navis &copy; 2026</span><span>Built for consequential decisions.</span></div>
        </footer>
      </div>
    `;

    this.bindRoutes();
    this.bindMenu();
    this.bindDemoForm();
    this.bindVideoEvents();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  bindRoutes() {
    this.container.querySelectorAll('[data-public-route]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        this.navigate(link.getAttribute('data-public-route'));
      });
    });
  }

  bindMenu() {
    const toggle = this.container.querySelector('.nw-menu-toggle');
    const nav = this.container.querySelector('.nw-main-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
  }

  bindDemoForm() {
    const form = this.container.querySelector('#nw-demo-form');
    const status = this.container.querySelector('#nw-demo-status');
    if (!form || !status) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const submission = Object.fromEntries(new FormData(form).entries());
      const requests = JSON.parse(localStorage.getItem('navis_public_demo_requests') || '[]');
      requests.push({ ...submission, submittedAt: new Date().toISOString() });
      localStorage.setItem('navis_public_demo_requests', JSON.stringify(requests));
      form.reset();
      status.textContent = 'Thank you. Your request has been received and the Navis team will follow up shortly.';
      status.classList.remove('is-hidden');
    });
  }

  bindVideoEvents() {
    const playButtons = this.container.querySelectorAll('.nw-play-overlay-btn, .nw-watch-walkthrough-btn, .nw-chapter-card');
    playButtons.forEach(btn => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        let timestamp = 0;
        if (btn.dataset.timestamp !== undefined) {
          timestamp = parseInt(btn.dataset.timestamp, 10);
        } else {
          const card = btn.closest('.nw-chapter-card');
          if (card && card.dataset.timestamp !== undefined) {
            timestamp = parseInt(card.dataset.timestamp, 10);
          }
        }
        
        this.openVideoModal(timestamp);
      });
    });
  }

  openVideoModal(seconds = 0) {
    this.closeVideoModal();

    const modal = document.createElement('div');
    modal.id = 'navis-video-modal';
    modal.className = 'nw-video-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Navis Walkthrough Video');
    
    const videoSrc = `/assets/video/navis-walkthrough.mp4#t=${seconds}`;
    
    modal.innerHTML = `
      <div class="nw-video-modal-backdrop"></div>
      <div class="nw-video-modal-container">
        <button class="nw-video-modal-close" aria-label="Close video player">&times;</button>
        <div class="nw-video-modal-body">
          <video id="navis-walkthrough-video" class="nw-video-element" controls playsinline>
            <source src="${videoSrc}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    const video = modal.querySelector('#navis-walkthrough-video');
    const closeBtn = modal.querySelector('.nw-video-modal-close');
    const backdrop = modal.querySelector('.nw-video-modal-backdrop');
    
    closeBtn.focus();
    
    if (seconds > 0) {
      video.addEventListener('loadedmetadata', () => {
        video.currentTime = seconds;
      });
    }
    
    video.play().catch(err => {
      console.warn("Playback blocked or failed:", err);
    });
    
    video.addEventListener('error', () => {
      const body = modal.querySelector('.nw-video-modal-body');
      if (body) {
        body.innerHTML = `
          <div class="nw-video-placeholder-message">
            <span class="nw-placeholder-icon">✦</span>
            <h3>Walkthrough coming soon</h3>
            <p>Our interactive 2-minute product tour is currently in private preview.</p>
          </div>
        `;
      }
    });

    const close = () => {
      try {
        video.pause();
      } catch (e) {}
      modal.remove();
      document.body.style.overflow = '';
    };
    
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    
    const keyHandler = (event) => {
      if (event.key === 'Escape') {
        close();
        document.removeEventListener('keydown', keyHandler);
      }
    };
    document.addEventListener('keydown', keyHandler);
  }

  closeVideoModal() {
    const modal = document.querySelector('#navis-video-modal');
    if (modal) {
      const video = modal.querySelector('video');
      if (video) {
        try {
          video.pause();
        } catch (e) {}
      }
      modal.remove();
      document.body.style.overflow = '';
    }
  }
}
