import { router } from './router.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { WelcomeScreen } from './components/WelcomeScreen.js';
import { CodeEntry } from './components/CodeEntry.js';
import { CardViewer } from './components/CardViewer.js';
import { FavoritesList } from './components/FavoritesList.js';
import { PrivateVault } from './components/PrivateVault.js';
import { MyCodesManager } from './components/MyCodesManager.js';
import { GiftCreator } from './components/GiftCreator.js';
import { ContributePage } from './components/ContributePage.js';

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const appEl = document.getElementById('app');

  // Mount header & footer
  const header = Header();
  body.insertBefore(header, appEl);
  body.appendChild(Footer());

  // Register routes
  router
    .on('welcome', (el) => WelcomeScreen(el))
    .on('codes', (el) => CodeEntry(el))
    .on('card', (el) => CardViewer(el))
    .on('favorites', (el) => FavoritesList(el))
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
