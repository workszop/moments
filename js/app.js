import { router } from './router.js';
import { renderHeader } from './components/Header.js';
import { WelcomeScreen } from './components/WelcomeScreen.js';
import { CodeEntry } from './components/CodeEntry.js';
import { CardViewer } from './components/CardViewer.js';

import { PrivateVault } from './components/PrivateVault.js';
import { MyCodesManager } from './components/MyCodesManager.js';
import { GiftCreator } from './components/GiftCreator.js';
import { ContributePage } from './components/ContributePage.js';

// Toast helper
window.showToast = function(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastT);
  window._toastT = setTimeout(() => t.classList.remove('show'), 1800);
};

document.addEventListener('DOMContentLoaded', () => {
  const headerEl = document.getElementById('header');
  const appEl = document.getElementById('app');

  // Mount header
  renderHeader(headerEl);

  // Register routes
  router
    .on('welcome', (el) => WelcomeScreen(el))
    .on('codes', (el) => CodeEntry(el))
    .on('card', (el) => CardViewer(el))

    .on('vault', (el) => PrivateVault(el))
    .on('my-codes', (el) => MyCodesManager(el))
    .on('create', (el) => GiftCreator(el))
    .on('contribute/:id', (el, params) => ContributePage(el, params));

  // Boot
  if (!window.location.hash) {
    window.location.hash = 'welcome';
  }
  router.init(appEl);
});
