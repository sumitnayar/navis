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
        <p>We are working closely with boards, founders and risk leaders shaping the next generation of governance intelligence.</p>
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

function renderHome(session) {
  const dashboardPath = session ? '/dashboard' : '/login';
  const dashboardLabel = session ? 'Open Dashboard' : 'Login';
  return `
    <main>
      <section class="nw-hero">
        <div class="nw-container nw-hero-grid">
          <div class="nw-hero-copy">
            <span class="nw-eyebrow">AI-native governance intelligence</span>
            <h1>AI-native governance and risk intelligence for modern boards.</h1>
            <p>Navis helps boards, leadership teams and risk professionals move beyond static risk registers into living governance, policy intelligence, scenario planning and board-ready decision support.</p>
            <div class="nw-actions">
              ${routeLink('/request-demo', 'Request Private Demo', 'nw-button nw-button-primary')}
              ${routeLink(dashboardPath, dashboardLabel, 'nw-button nw-button-secondary')}
            </div>
            <div class="nw-trust-line"><span>Built for consequential decisions</span><span>Human approval by design</span><span>Private preview</span></div>
          </div>
          ${renderHeroVisual()}
        </div>
      </section>
      ${renderPillars()}
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
            <span><b>05</b>Compliance evidence lives across documents and spreadsheets</span>
          </div>
        </div>
      </section>
      ${renderPlatformSection()}
      ${renderPolicySection()}
      ${renderDecisionSection()}
      <section class="nw-band nw-band-soft">
        <div class="nw-container">
          <div class="nw-section-heading">
            <span class="nw-eyebrow">Who Navis is for</span>
            <h2>One shared intelligence layer. Five critical perspectives.</h2>
          </div>
          <div class="nw-audience-grid">
            ${[
              ['Boards and Independent Directors', 'See the exposure, evidence and choices behind every material decision.'],
              ['CEOs and Founders', 'Connect strategic ambition to the risks and actions that shape execution.'],
              ['CROs and Risk Teams', 'Replace fragmented registers with a living enterprise risk system.'],
              ['Compliance and Privacy Teams', 'Govern policies, clauses and evidence through controlled workflows.'],
              ['Investors and Advisors', 'Understand resilience, readiness and decision quality with greater clarity.']
            ].map(([title, copy]) => `<article><h3>${title}</h3><p>${copy}</p></article>`).join('')}
          </div>
        </div>
      </section>
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
            <div><strong>Product</strong>${routeLink('/product', 'Platform')}${routeLink('/policy-studio', 'Policy Studio')}${routeLink('/board-decision-room', 'Board Decision Room')}</div>
            <div><strong>Company</strong>${routeLink('/about', 'About')}${routeLink('/request-demo', 'Contact')}${routeLink(accountPath, accountLabel)}</div>
            <div class="nw-footer-preview"><strong>Private preview</strong><p>AI-native governance intelligence for modern boards.</p></div>
          </div>
          <div class="nw-container nw-footer-bottom"><span>Navis &copy; 2026</span><span>Built for consequential decisions.</span></div>
        </footer>
      </div>
    `;

    this.bindRoutes();
    this.bindMenu();
    this.bindDemoForm();
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
}
