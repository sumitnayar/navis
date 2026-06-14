// Core Application Shell, Auth Boundary, and Route Coordinator for NAVIS V3

import { AuthService } from './services/authService.js';
import { StorageService } from './services/storageService.js';
import { DashboardComponent } from './components/dashboard.js';
import { ObjectivesComponent } from './components/objectives.js';
import { ScenarioComponent } from './components/scenario.js';
import { PortfolioComponent } from './components/portfolio.js';
import { NetworkComponent } from './components/network.js?v=3.0.3';
import { RegisterComponent } from './components/register.js';
import { TaxonomyComponent } from './components/taxonomy.js';
import { AssuranceComponent } from './components/assurance.js';
import { ControlsComponent } from './components/controls.js';
import { ActionsComponent } from './components/actions.js';
import { CultureComponent } from './components/culture.js';
import { SettingsComponent } from './components/settings.js';
import { BoardQAComponent } from './components/boardQA.js';
import { IntelligencePolicyComponent } from './components/intelligencePolicy.js';
import { BoardPackComponent } from './components/boardPack.js';
import { PolicyStudioComponent } from './components/policyStudio.js';
import { PublicWebsite } from './components/publicWebsite.js';

const TAB_ROUTES = {
  dashboard: '/dashboard',
  intelligencePolicy: '/policy',
  policyStudio: '/policy-studio',
  boardQA: '/ai',
  objectives: '/objectives',
  scenario: '/scenario',
  portfolio: '/portfolio',
  network: '/network',
  boardPack: '/board-pack',
  register: '/risks',
  taxonomy: '/taxonomy',
  assurance: '/assurance',
  controls: '/controls',
  actions: '/actions',
  culture: '/culture',
  settings: '/settings'
};

const PROTECTED_ROUTES = {
  '/dashboard': 'dashboard',
  '/board-qa': 'boardQA',
  '/ai': 'boardQA',
  '/intake': 'intelligencePolicy',
  '/policy': 'intelligencePolicy',
  '/policy-studio': 'policyStudio',
  '/intelligence-policy': 'intelligencePolicy',
  '/objectives': 'objectives',
  '/scenario': 'scenario',
  '/scenarios': 'scenario',
  '/portfolio': 'portfolio',
  '/network': 'network',
  '/board-pack': 'boardPack',
  '/risks': 'register',
  '/risk-register': 'register',
  '/register': 'register',
  '/incidents': 'register',
  '/reports': 'dashboard',
  '/taxonomy': 'taxonomy',
  '/assurance': 'assurance',
  '/controls': 'controls',
  '/actions': 'actions',
  '/culture': 'culture',
  '/settings': 'settings'
};

const PUBLIC_WEBSITE_ROUTES = new Set([
  '/',
  '/product',
  '/policy-studio',
  '/board-decision-room',
  '/about',
  '/request-demo',
  '/contact'
]);

const PUBLIC_ROUTES = new Set([...PUBLIC_WEBSITE_ROUTES, '/login']);

const MODE_TABS = {
  board: ['dashboard', 'intelligencePolicy', 'policyStudio', 'boardQA', 'objectives', 'scenario', 'network', 'portfolio', 'boardPack'],
  intelligence: ['dashboard', 'intelligencePolicy', 'policyStudio', 'boardQA', 'objectives', 'scenario', 'network', 'portfolio', 'boardPack'],
  builder: ['dashboard', 'intelligencePolicy', 'policyStudio', 'boardQA', 'objectives', 'scenario', 'network', 'portfolio', 'boardPack']
};

const TAB_LABELS = {
  dashboard: 'Dashboard',
  intelligencePolicy: 'Intelligence Desk',
  policyStudio: 'Policy Studio',
  boardQA: 'Ask Navis',
  objectives: 'Objectives',
  scenario: 'Board Decision Room',
  network: 'Cascade Map',
  portfolio: 'Portfolio Mapper',
  boardPack: 'Board Pack'
};

function getCurrentPath() {
  const path = window.location.pathname.replace(/\/+$/, '');
  return path || '/';
}

class RiskOSApplication {
  constructor() {
    const defaultSettings = {
      brandName: 'NAVIS',
      geminiApiKey: '',
      companyName: 'ScaleFlow Technologies Pvt Ltd',
      revenueBracket: '₹280 Cr (FY26)',
      ipoTimeline: 'Target Q3 FY27 (NSE/BSE Mainboard)',
      soc2Status: 'SOC 2 Type II Certified',
      businessUnits: ['Enterprise Sales', 'Engineering & Infrastructure', 'Security Operations', 'Finance Operations', 'Legal & HR', 'Product Management'],
      locations: ['Bangalore HQ', 'Chennai Dev Center', 'US Delaware Entity'],
      activeUserRole: 'CRO (Chief Risk Officer)'
    };

    this.state = {
      risks: [],
      settings: defaultSettings,
      objectives: [],
      scenarios: [],
      cultureMetrics: {},
      activeTab: 'dashboard',
      editingRiskId: null,
      isLoading: true,
      operatingMode: localStorage.getItem('navis_operating_mode') || 'board'
    };

    this.components = {};
    this.activeComponentInstance = null;
    this.appHasInitialized = false;
    this.sidebarEventsBound = false;
    this.appContainer = document.querySelector('#app-container');
    this.publicContainer = document.querySelector('#public-route-container');
    this.publicWebsite = new PublicWebsite(this.publicContainer, (path) => this.navigate(path));
  }

  async initialize() {
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });

    AuthService.onAuthStateChange((session) => {
      const path = getCurrentPath();
      const protectedPolicyStudioIsOpen = path === '/policy-studio'
        && !this.appContainer.classList.contains('is-hidden');
      if (!session && (!PUBLIC_ROUTES.has(path) || protectedPolicyStudioIsOpen)) {
        this.resetAuthenticatedState();
        this.navigate('/login', { replace: true });
      }
    });

    await this.handleRoute();
  }

  async handleRoute() {
    const path = getCurrentPath();
    const session = await this.getSessionSafely();

    if (PUBLIC_WEBSITE_ROUTES.has(path) && !(path === '/policy-studio' && session)) {
      this.renderPublicWebsite(path, session);
      return;
    }

    if (path === '/login') {
      if (session) {
        this.navigate('/dashboard', { replace: true });
        return;
      }

      this.renderLogin();
      return;
    }

    const tabId = PROTECTED_ROUTES[path];
    if (!tabId) {
      this.navigate(session ? '/dashboard' : '/login', { replace: true });
      return;
    }

    if (!session) {
      this.navigate('/login', { replace: true });
      return;
    }

    await this.renderAuthenticatedApp(tabId);
  }

  async getSessionSafely() {
    try {
      return await AuthService.getSession();
    } catch (error) {
      console.warn('Unable to read auth session:', error.message);
      return null;
    }
  }

  navigate(path, options = {}) {
    if (getCurrentPath() !== path) {
      const update = options.replace ? 'replaceState' : 'pushState';
      window.history[update]({}, '', path);
    }

    this.handleRoute();
  }

  showPublicRoute() {
    document.body.classList.add('public-page');
    document.body.classList.remove('app-page');
    this.publicContainer.classList.remove('is-hidden');
    this.appContainer.classList.add('is-hidden');
    this.appContainer.setAttribute('aria-hidden', 'true');
  }

  showAuthenticatedApp() {
    document.body.classList.add('app-page');
    document.body.classList.remove('public-page');
    this.publicContainer.classList.add('is-hidden');
    this.appContainer.classList.remove('is-hidden');
    this.appContainer.removeAttribute('aria-hidden');
  }

  renderPublicWebsite(path, session) {
    this.showPublicRoute();
    this.publicWebsite.render(path, session);
  }

  renderHome(session) {
    this.showPublicRoute();
    document.title = 'Navis | Navigate Risk. Enable Growth.';

    const primaryPath = session ? '/dashboard' : '/login';
    const primaryLabel = session ? 'Open Dashboard' : 'Sign In';

    this.publicContainer.innerHTML = `
      <div class="public-page-shell">
        <header class="public-nav">
          <a class="public-brand" href="/" data-route="/">
            <span class="public-brand-mark">NV</span>
            <span>Navis</span>
          </a>
          <nav class="public-nav-actions" aria-label="Primary">
            <a href="${primaryPath}" data-route="${primaryPath}">${primaryLabel}</a>
            <a class="btn btn-primary btn-small btn-request-demo" href="/contact" data-route="/contact">Request Demo</a>
          </nav>
        </header>

        <main class="public-home">
          <section class="public-hero">
            <div class="hero-copy">
              <span class="public-kicker">Private Preview</span>
              <h1>Navis</h1>
              <p class="hero-tagline">Navigate Risk. Enable Growth.</p>
              <p class="hero-description">Navis is an AI-enabled Enterprise Risk Management platform designed for boards, leadership teams, risk professionals, and growing organizations.</p>
              <p class="hero-support">Navis helps organizations move beyond static spreadsheets and fragmented risk registers by bringing risks, controls, incidents, actions, compliance oversight, and board reporting into one intelligent operating layer.</p>
              <div class="hero-actions">
                <a class="btn btn-primary" href="${primaryPath}" data-route="${primaryPath}">${primaryLabel} &rarr;</a>
                <a class="btn btn-secondary btn-request-demo" href="/contact" data-route="/contact">Request Demo</a>
              </div>
            </div>
            <div class="hero-signal-panel" aria-label="Risk intelligence preview">
              <div class="signal-header">
                <span>Board Risk Intelligence</span>
                <span class="status-badge within">Live</span>
              </div>
              <div class="signal-metric-row">
                <span>Enterprise Risk Posture</span>
                <strong>Elevated</strong>
              </div>
              <div class="signal-bars">
                <span style="height: 72%;"></span>
                <span style="height: 46%;"></span>
                <span style="height: 84%;"></span>
                <span style="height: 38%;"></span>
                <span style="height: 61%;"></span>
              </div>
              <div class="signal-grid">
                <div>
                  <span>Controls</span>
                  <strong>82%</strong>
                </div>
                <div>
                  <span>Actions</span>
                  <strong>14</strong>
                </div>
                <div>
                  <span>Reports</span>
                  <strong>Ready</strong>
                </div>
              </div>
            </div>
          </section>

          <section class="public-section">
            <div class="section-copy">
              <span class="public-kicker">Built for Modern Governance</span>
              <h2>Built for Modern Governance</h2>
              <p>Modern organizations need more than risk documentation. They need risk intelligence. Navis helps teams identify, assess, monitor, and respond to risks while aligning enterprise risk management with strategic objectives, compliance expectations, and board-level oversight.</p>
            </div>
            <div class="capability-grid">
              ${this.renderCapabilityCards([
                'Enterprise Risk Management',
                'Control Monitoring',
                'Incident Management',
                'Compliance Intelligence',
                'AI-Assisted Risk Analysis',
                'Board-Ready Reporting'
              ])}
            </div>
          </section>

          <section class="public-section public-section-split">
            <div class="section-copy">
              <span class="public-kicker">Operating Layer</span>
              <h2>From Risk Visibility to Risk Intelligence</h2>
              <p>Navis combines structured governance workflows with AI-powered insights to help organizations strengthen resilience, improve accountability, and make better decisions.</p>
            </div>
            <div class="intelligence-list">
              <span>Risk identification and assessment</span>
              <span>Control and KRI monitoring</span>
              <span>Incident and action accountability</span>
              <span>Board-ready reporting cadence</span>
            </div>
          </section>
        </main>

        <footer class="public-footer">
          <span>Navis &copy; 2026</span>
          <span>Private Preview</span>
        </footer>
      </div>
    `;

    this.bindPublicRouteLinks();

    // Bind Request Demo modal triggers
    this.publicContainer.querySelectorAll('.btn-request-demo').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.showRequestDemoModal();
      });
    });
  }

  renderCapabilityCards(labels) {
    return labels.map((label) => `
      <article class="capability-card">
        <span class="capability-dot"></span>
        <h3>${label}</h3>
      </article>
    `).join('');
  }

  renderLogin() {
    this.showPublicRoute();
    document.title = 'Sign In | Navis';

    const authWarning = AuthService.isConfigured()
      ? ''
      : '<div class="auth-message error">Supabase authentication is not configured for this deployment.</div>';

    this.publicContainer.innerHTML = `
      <div class="auth-page-shell">
        <a class="public-brand auth-brand" href="/" data-route="/">
          <span class="public-brand-mark">NV</span>
          <span>Navis</span>
        </a>

        <section class="auth-card">
          <span class="public-kicker">Private Preview</span>
          <h1>Sign in to Navis</h1>
          <p>Access the board risk intelligence console.</p>
          ${authWarning}
          <form id="login-form" class="auth-form">
            <div class="form-group">
              <label for="login-email">Email</label>
              <input id="login-email" class="form-control" type="email" autocomplete="email" required />
            </div>
            <div class="form-group">
              <label for="login-password">Password</label>
              <input id="login-password" class="form-control" type="password" autocomplete="current-password" required />
            </div>
            <div id="login-error" class="auth-message error is-hidden"></div>
            <button id="login-submit" class="btn btn-primary auth-submit" type="submit">Sign In</button>
          </form>
        </section>
      </div>
    `;

    this.bindPublicRouteLinks();
    this.bindLoginForm();
  }

  bindLoginForm() {
    const form = document.querySelector('#login-form');
    const errorEl = document.querySelector('#login-error');
    const submitBtn = document.querySelector('#login-submit');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      errorEl.classList.add('is-hidden');
      errorEl.textContent = '';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';

      try {
        const email = form.querySelector('#login-email').value.trim();
        const password = form.querySelector('#login-password').value;
        await AuthService.signIn(email, password);
        this.navigate('/dashboard', { replace: true });
      } catch (error) {
        errorEl.textContent = error.message || 'Unable to sign in. Check your email and password.';
        errorEl.classList.remove('is-hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    });
  }

  renderContact(session) {
    this.showPublicRoute();
    document.title = 'Request Demo | Navis';

    const primaryPath = session ? '/dashboard' : '/login';
    const primaryLabel = session ? 'Open Dashboard' : 'Sign In';

    this.publicContainer.innerHTML = `
      <div class="auth-page-shell contact-shell">
        <header class="public-nav contact-nav">
          <a class="public-brand" href="/" data-route="/">
            <span class="public-brand-mark">NV</span>
            <span>Navis</span>
          </a>
          <a href="${primaryPath}" data-route="${primaryPath}">${primaryLabel}</a>
        </header>

        <section class="auth-card contact-card">
          <span class="public-kicker">Request Demo</span>
          <h1>See Navis in private preview</h1>
          <p>Share a few details and the Navis team will follow up.</p>
          <form id="contact-form" class="auth-form">
            <div class="form-group">
              <label for="contact-name">Name</label>
              <input id="contact-name" class="form-control" type="text" autocomplete="name" required />
            </div>
            <div class="form-group">
              <label for="contact-email">Email</label>
              <input id="contact-email" class="form-control" type="email" autocomplete="email" required />
            </div>
            <div class="form-group">
              <label for="contact-company">Company</label>
              <input id="contact-company" class="form-control" type="text" autocomplete="organization" />
            </div>
            <div class="form-group">
              <label for="contact-message">Message</label>
              <textarea id="contact-message" class="form-control" rows="5"></textarea>
            </div>
            <div id="contact-success" class="auth-message success is-hidden">Request received. The preview team will follow up shortly.</div>
            <button class="btn btn-primary auth-submit" type="submit">Request Demo</button>
          </form>
        </section>
      </div>
    `;

    this.bindPublicRouteLinks();
    this.bindContactForm();
  }

  bindContactForm() {
    const form = document.querySelector('#contact-form');
    const successEl = document.querySelector('#contact-success');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      form.reset();
      successEl.classList.remove('is-hidden');
    });
  }

  bindPublicRouteLinks() {
    this.publicContainer.querySelectorAll('[data-route]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        this.navigate(link.getAttribute('data-route'));
      });
    });
  }

  showRequestDemoModal() {
    let modal = document.querySelector('#request-demo-modal');
    if (modal) return;

    modal = document.createElement('div');
    modal.id = 'request-demo-modal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-container">
        <button class="modal-close-btn" aria-label="Close modal">&times;</button>
        <div class="modal-content">
          <h2 class="modal-heading">Request Access to Navis</h2>
          <p class="modal-subheading">Share a few details and the Navis team will follow up.</p>
          <form id="modal-demo-form" class="modal-form">
            <div class="form-group">
              <label for="modal-name">Full Name</label>
              <input id="modal-name" class="form-control" type="text" autocomplete="name" required placeholder="John Doe" />
            </div>
            <div class="form-group">
              <label for="modal-company">Company Name</label>
              <input id="modal-company" class="form-control" type="text" autocomplete="organization" required placeholder="Acme Corp" />
            </div>
            <div class="form-group">
              <label for="modal-email">Work Email</label>
              <input id="modal-email" class="form-control" type="email" autocomplete="email" required placeholder="john@acme.com" />
            </div>
            <div id="modal-error-message" class="modal-error is-hidden"></div>
            <button id="modal-submit-btn" class="btn btn-primary modal-submit" type="submit">Request Access</button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        this.closeRequestDemoModal();
      }
    });

    const closeBtn = modal.querySelector('.modal-close-btn');
    closeBtn.addEventListener('click', () => {
      this.closeRequestDemoModal();
    });

    const form = modal.querySelector('#modal-demo-form');
    const submitBtn = modal.querySelector('#modal-submit-btn');
    const errorEl = modal.querySelector('#modal-error-message');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      errorEl.classList.add('is-hidden');
      errorEl.textContent = '';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      const name = form.querySelector('#modal-name').value.trim();
      const company = form.querySelector('#modal-company').value.trim();
      const email = form.querySelector('#modal-email').value.trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errorEl.textContent = 'Please enter a valid work email address.';
        errorEl.classList.remove('is-hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request Access';
        return;
      }

      try {
        let isSuccess = false;
        
        try {
          const response = await fetch('/api/demo-request', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, company, email })
          });

          if (response.ok) {
            isSuccess = true;
          } else {
            const errResult = await response.json().catch(() => ({}));
            console.error('Vercel API request failed:', errResult);
          }
        } catch (apiError) {
          console.warn('API route /api/demo-request unavailable or failed. Trying direct client fallback...', apiError);
        }

        if (!isSuccess) {
          const isSupabaseLive = window.supabase && window.ENV?.SUPABASE_URL && window.ENV?.SUPABASE_KEY && window.ENV?.SUPABASE_URL !== '__SUPABASE_URL__';
          
          if (isSupabaseLive) {
            try {
              const localClient = window.supabase.createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_KEY);
              const { error } = await localClient
                .from('demo_requests')
                .insert([{ full_name: name, company_name: company, work_email: email }]);

              if (error) throw error;
              isSuccess = true;
              console.log('Successfully saved demo request to Supabase via client fallback.');
            } catch (dbError) {
              console.error('Direct Supabase insert failed:', dbError);
            }
          }
          
          if (!isSuccess) {
            try {
              const pendingRequests = JSON.parse(localStorage.getItem('navis_pending_demo_requests') || '[]');
              pendingRequests.push({ name, company, email, submittedAt: new Date().toISOString() });
              localStorage.setItem('navis_pending_demo_requests', JSON.stringify(pendingRequests));
              isSuccess = true;
              console.log('Offline demo mode: Saved request to localStorage.', { name, company, email });
            } catch (lsError) {
              console.error('Failed to save to localStorage:', lsError);
            }
          }
          
          if (isSuccess) {
            console.log('%c[SIMULATED EMAIL NOTIFICATION]', 'color: #00B5B5; font-weight: bold;', {
              subject: 'New Demo Request — Navis',
              to: 'sumitnayar@gmail.com',
              body: {
                fullName: name,
                companyName: company,
                workEmail: email,
                timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + ' (IST)'
              }
            });
          }
        }

        if (isSuccess) {
          const modalContent = modal.querySelector('.modal-content');
          modalContent.innerHTML = `
            <div class="modal-success-message">
              <span class="success-icon">✓</span>
              <h3>Thank you. We'll be in touch within 24 hours.</h3>
              <button class="btn btn-secondary modal-close-after-success" style="margin-top: 12px; width: 100%;">Close</button>
            </div>
          `;
          
          modalContent.querySelector('.modal-close-after-success').addEventListener('click', () => {
            this.closeRequestDemoModal();
          });
        } else {
          throw new Error('All submission routes failed.');
        }

      } catch (submitErr) {
        console.error('Submission error:', submitErr);
        errorEl.textContent = 'Something went wrong. Please email us at hello@navisrisk.com';
        errorEl.classList.remove('is-hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request Access';
      }
    });
  }

  closeRequestDemoModal() {
    const modal = document.querySelector('#request-demo-modal');
    if (modal) {
      modal.remove();
    }
  }

  async renderAuthenticatedApp(tabId) {
    this.showAuthenticatedApp();

    if (!this.appHasInitialized) {
      StorageService.init();
      
      this.components = {
        dashboard: DashboardComponent,
        boardQA: BoardQAComponent,
        intelligencePolicy: IntelligencePolicyComponent,
        policyStudio: PolicyStudioComponent,
        objectives: ObjectivesComponent,
        scenario: ScenarioComponent,
        portfolio: PortfolioComponent,
        network: NetworkComponent,
        boardPack: BoardPackComponent,
        register: RegisterComponent,
        taxonomy: TaxonomyComponent,
        assurance: AssuranceComponent,
        controls: ControlsComponent,
        actions: ActionsComponent,
        culture: CultureComponent,
        settings: SettingsComponent
      };

      this.updateBrandVisuals();
      this.renderTopNav();
      this.bindTopNavEvents();
      this.appHasInitialized = true;

      // 1. Render skeletons immediately (no blocking)
      this.routeTo(tabId, { updateUrl: false });

      // 2. Fetch data in the background asynchronously
      Promise.all([
        StorageService.getRisks(),
        StorageService.getSettings(),
        StorageService.getObjectives(),
        StorageService.getScenarios(),
        StorageService.getCultureMetrics()
      ]).then(([risks, settings, objectives, scenarios, cultureMetrics]) => {
        this.state.risks = risks;
        this.state.settings = settings;
        this.state.objectives = objectives;
        this.state.scenarios = scenarios;
        this.state.cultureMetrics = cultureMetrics;
        this.state.isLoading = false;

        this.updateBrandVisuals();
        this.renderTopNav();
        this.renderPostureBar();

        // Check Gemini config status in the background
        fetch('/api/gemini').then(resp => {
          if (resp.ok) return resp.json();
          return { configured: false };
        }).then(status => {
          this.state.serverGeminiConfigured = !!status.configured;
          this.updateBrandVisuals();
        }).catch(() => {
          this.state.serverGeminiConfigured = false;
        });

        // Re-render current active view with loaded data
        if (this.activeComponentInstance) {
          const mainContainer = document.querySelector('#page-render-container');
          if (mainContainer) {
            this.activeComponentInstance.render(mainContainer);
          }
        }
      }).catch(err => {
        console.error("Failed to load application data in background:", err);
      });
    } else {
      this.routeTo(tabId, { updateUrl: false });
    }
  }

  async initializeAuthenticatedState() {
    this.appHasInitialized = true;
  }

  updateBrandVisuals() {
    const s = this.state.settings;
    document.title = `${s.brandName || 'NAVIS'} | Board Risk Intelligence Platform`;

    const companyEl = document.querySelector('#top-nav-company-name');
    if (companyEl) {
      companyEl.textContent = s.companyName || '';
      companyEl.title = s.companyName || '';
    }
  }

  renderTopNav() {
    // Clean up old mode switcher from index.html if it's cached in browser DOM
    document.getElementById('mode-switcher')?.remove();
    document.getElementById('mode-switcher-divider')?.remove();

    const mode = this.state.operatingMode || 'board';
    const allowedTabs = MODE_TABS[mode];
    const navContainer = document.getElementById('top-nav-modules');
    if (navContainer) {
      navContainer.innerHTML = allowedTabs
        .filter(tabId => tabId !== 'settings')
        .map(tabId => `
          <div class="top-nav-item" id="nav-${tabId}" data-tab="${tabId}">${TAB_LABELS[tabId]}</div>
        `).join('');
      
      navContainer.querySelectorAll('.top-nav-item[data-tab]').forEach(el => {
        el.addEventListener('click', () => this.routeTo(el.dataset.tab));
      });
    }

    const companyEl = document.getElementById('top-nav-company');
    if (companyEl && this.state.settings?.companyName) {
      companyEl.textContent = this.state.settings.companyName;
    }

    // Settings gear is always visible in the top-nav
    const settingsGear = document.getElementById('top-nav-settings');
    const settingsDivider = document.getElementById('settings-divider');
    if (settingsGear && settingsDivider) {
      settingsGear.style.display = 'inline-block';
      settingsDivider.style.display = 'inline-block';
    }

    this.updateTopNavActive(this.currentTab || this.state.activeTab);
  }

  updateTopNavActive(tabId) {
    document.querySelectorAll('.top-nav-item').forEach(el => el.classList.remove('active'));
    const activeEl = document.getElementById(`nav-${tabId}`);
    if (activeEl) {
      activeEl.classList.add('active');
    }
  }

  routeTo(tabId, options = {}) {
    const mode = this.state.operatingMode || 'board';
    const allowedTabs = MODE_TABS[mode];
    if (!allowedTabs.includes(tabId)) {
      tabId = 'dashboard';
    }

    if (!this.components[tabId]) return;

    if (options.updateUrl !== false) {
      const path = TAB_ROUTES[tabId] || '/dashboard';
      if (getCurrentPath() !== path) {
        window.history.pushState({}, '', path);
      }
    }

    this.state.activeTab = tabId;
    this.currentTab = tabId;
    this.updateTopNavActive(tabId);
    this.updateBrandVisuals();
    this.renderPostureBar();

    const mainContainer = document.querySelector('#page-render-container');
    if (!mainContainer) return;

    mainContainer.innerHTML = '';

    const ComponentClass = this.components[tabId];
    this.activeComponentInstance = new ComponentClass(this.state, (stateUpdates) => {
      if (stateUpdates) {
        if (stateUpdates.operatingMode) {
          this.setOperatingMode(stateUpdates.operatingMode);
          return;
        }
        Object.assign(this.state, stateUpdates);
        this.updateBrandVisuals();
        
        if (stateUpdates.activeTab) {
          this.routeTo(stateUpdates.activeTab);
        } else {
          this.activeComponentInstance.render(mainContainer);
        }
      }
    });

    this.activeComponentInstance.render(mainContainer);
  }

  bindTopNavEvents() {
    // Settings
    document.getElementById('top-nav-settings')?.addEventListener('click',
      () => this.routeTo('settings'));

    // Sign out
    document.getElementById('top-nav-signout')?.addEventListener('click',
      () => this.handleSignOut());
  }

  setOperatingMode(mode) {
    this.state.operatingMode = mode;
    localStorage.setItem('navis_operating_mode', mode);
    
    this.renderTopNav();

    // Intercept active tab if not allowed in new mode
    const allowedTabs = MODE_TABS[mode];
    if (!allowedTabs.includes(this.state.activeTab)) {
      this.routeTo('dashboard');
    } else {
      this.routeTo(this.state.activeTab);
    }
  }

  async handleSignOut() {
    await AuthService.signOut();
    this.resetAuthenticatedState();
    this.navigate('/login', { replace: true });
  }

  renderPostureBar() {
    const risks = this.state.risks || [];
    const today = new Date();
    
    const aboveAppetiteCount = risks.filter(r => r.appetiteStatus === 'Above Appetite').length;
    const worseningCount = risks.filter(r => r.trend === 'Deteriorating').length;
    const breachedKRIs = risks.filter(r => r.kris?.some(k => k.status === 'BREACHED')).length;
    const overdueActionsCount = risks.flatMap(r => r.actions || [])
      .filter(a => a.status !== 'Completed' && new Date(a.dueDate) < today).length;

    let postureValue = "LOW";
    let postureColor = "#1D9E75"; // LOW = green
    if (aboveAppetiteCount > 15 || breachedKRIs > 20 || overdueActionsCount > 10) {
      postureValue = "CRITICAL";
      postureColor = "#E24B4A"; // CRITICAL = red
    } else if (aboveAppetiteCount > 0 || breachedKRIs > 0 || overdueActionsCount > 0) {
      postureValue = "ELEVATED";
      postureColor = "#EF9F27"; // ELEVATED = amber
    } else if (worseningCount > 0) {
      postureValue = "MODERATE";
      postureColor = "#4A6FA5"; // MODERATE = slate
    }

    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    let postureBar = mainContent.querySelector('.posture-bar');
    if (!postureBar) {
      postureBar = document.createElement('div');
      postureBar.className = 'posture-bar no-print';
      mainContent.insertBefore(postureBar, mainContent.firstChild);
    }

    postureBar.innerHTML = `
      <div class="posture-bar-content">
        <span class="posture-label">ENTERPRISE RISK POSTURE</span>
        <span class="posture-pill" style="background-color: ${postureColor}">${postureValue}</span>
        <div class="posture-divider"></div>
        <div class="posture-stat">
          <span class="posture-stat-label">Above Appetite</span>
          <span class="posture-stat-value" style="color: var(--color-critical);">${aboveAppetiteCount}</span>
        </div>
        <div class="posture-divider"></div>
        <div class="posture-stat">
          <span class="posture-stat-label">KRI Breaches</span>
          <span class="posture-stat-value" style="color: var(--color-warning);">${breachedKRIs}</span>
        </div>
        <div class="posture-divider"></div>
        <div class="posture-stat">
          <span class="posture-stat-label">Worsening</span>
          <span class="posture-stat-value" style="color: var(--color-warning);">${worseningCount}</span>
        </div>
        <div class="posture-divider"></div>
        <div class="posture-stat">
          <span class="posture-stat-label">Overdue Actions</span>
          <span class="posture-stat-value" style="color: var(--color-critical);">${overdueActionsCount}</span>
        </div>
        <div style="flex-grow: 1;"></div>
        <div class="posture-live-indicator">
          <span class="posture-pulsing-dot"></span>
          <span class="posture-live-text">Live</span>
        </div>
      </div>
    `;
  }

  resetAuthenticatedState() {
    this.appHasInitialized = false;
    this.activeComponentInstance = null;
    this.state.activeTab = 'dashboard';

    const mainContainer = document.querySelector('#page-render-container');
    if (mainContainer) {
      mainContainer.innerHTML = '';
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new RiskOSApplication();
  app.initialize();
});
