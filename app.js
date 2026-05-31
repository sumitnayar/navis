// Core Application Shell & Tab Router Coordinate Layer for NAVIS V3

import { StorageService } from './services/storageService.js';
import { DashboardComponent } from './components/dashboard.js';
import { ObjectivesComponent } from './components/objectives.js';
import { ScenarioComponent } from './components/scenario.js';
import { PortfolioComponent } from './components/portfolio.js';
import { NetworkComponent } from './components/network.js';
import { RegisterComponent } from './components/register.js';
import { TaxonomyComponent } from './components/taxonomy.js';
import { AssuranceComponent } from './components/assurance.js';
import { ControlsComponent } from './components/controls.js';
import { ActionsComponent } from './components/actions.js';
import { CultureComponent } from './components/culture.js';
import { SettingsComponent } from './components/settings.js';

class RiskOSApplication {
  constructor() {
    this.state = {
      risks: [],
      settings: {},
      objectives: [],
      scenarios: [],
      cultureMetrics: {},
      activeTab: 'dashboard', // default board first landing page
      editingRiskId: null // used to deep-link node selection to forms
    };

    this.components = {};
    this.activeComponentInstance = null;
  }

  async initialize() {
    // 1. Seed database if first load, fetch active register
    StorageService.init();
    
    // Load all relational modules (F1, F4, F9, F2)
    this.state.risks = await StorageService.getRisks();
    this.state.settings = await StorageService.getSettings();
    this.state.objectives = await StorageService.getObjectives();
    this.state.scenarios = await StorageService.getScenarios();
    this.state.cultureMetrics = await StorageService.getCultureMetrics();

    // 2. Setup sidebar branding and session tags
    this.updateBrandVisuals();
    this.renderSidebar();

    // 3. Register routing components (All V3 modules)
    this.components = {
      'dashboard': DashboardComponent,
      'objectives': ObjectivesComponent,
      'scenario': ScenarioComponent,
      'portfolio': PortfolioComponent,
      'network': NetworkComponent,
      'register': RegisterComponent,
      'taxonomy': TaxonomyComponent,
      'assurance': AssuranceComponent,
      'controls': ControlsComponent,
      'actions': ActionsComponent,
      'culture': CultureComponent,
      'settings': SettingsComponent
    };

    // 4. Bind sidebar clicks
    this.bindSidebarEvents();

    // 5. Initial render of landing page
    this.routeTo(this.state.activeTab);
  }

  updateBrandVisuals() {
    const s = this.state.settings;
    
    // Logo Initials
    const logoEl = document.querySelector('#sidebar-logo');
    if (logoEl && s.brandName) {
      const letters = s.brandName.split(' ').map(w => w[0]).join('');
      logoEl.textContent = letters.slice(0, 2).toUpperCase();
    }

    // Logo Text
    const nameEl = document.querySelector('#sidebar-brand-name');
    if (nameEl && s.brandName) {
      nameEl.textContent = s.brandName;
    }

    // Document Title
    document.title = `${s.brandName || 'NAVIS'} | Board Risk Intelligence Platform`;

    // Session Context tags
    const roleEl = document.querySelector('#profile-active-role');
    if (roleEl) roleEl.textContent = s.activeUserRole;

    const companyEl = document.querySelector('#profile-active-company');
    if (companyEl) companyEl.textContent = s.companyName;
  }

  renderSidebar() {
    // We statically bind sidebar items in index.html and update active classes.
    const tabs = [
      'dashboard', 'objectives', 'scenario', 'portfolio', 'network',
      'register', 'taxonomy', 'assurance', 'controls', 'actions',
      'culture', 'settings'
    ];
    tabs.forEach(tab => {
      const link = document.querySelector(`#nav-${tab}`);
      if (link) {
        if (tab === this.state.activeTab) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  }

  // Routing coordinator
  routeTo(tabId) {
    if (!this.components[tabId]) return;

    this.state.activeTab = tabId;
    this.renderSidebar();
    this.updateBrandVisuals();

    const mainContainer = document.querySelector('#page-render-container');
    if (mainContainer) {
      // Clear container
      mainContainer.innerHTML = '';
      
      // Instantiate and render component
      const ComponentClass = this.components[tabId];
      this.activeComponentInstance = new ComponentClass(this.state, (stateUpdates) => {
        // State update reactive callback: merges updates, refreshes core components
        if (stateUpdates) {
          Object.assign(this.state, stateUpdates);
          this.updateBrandVisuals();
          
          // If tab routing was requested during state update
          if (stateUpdates.activeTab) {
            this.routeTo(stateUpdates.activeTab);
          } else {
            // Re-render active
            this.activeComponentInstance.render(mainContainer);
          }
        }
      });

      this.activeComponentInstance.render(mainContainer);
    }
  }

  bindSidebarEvents() {
    const tabs = [
      'dashboard', 'objectives', 'scenario', 'portfolio', 'network',
      'register', 'taxonomy', 'assurance', 'controls', 'actions',
      'culture', 'settings'
    ];
    tabs.forEach(tab => {
      const link = document.querySelector(`#nav-${tab}`);
      if (link) {
        link.addEventListener('click', () => {
          this.routeTo(tab);
        });
      }
    });
  }
}

// Boot application when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  const app = new RiskOSApplication();
  app.initialize();
});
