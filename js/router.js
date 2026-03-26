class Router {
  constructor() {
    this._routes = {};
    this._currentCleanup = null;
    this._appEl = null;
    window.addEventListener('hashchange', () => this._resolve());
  }

  init(appEl) {
    this._appEl = appEl;
    this._resolve();
  }

  on(hash, handler) {
    this._routes[hash] = handler;
    return this;
  }

  navigate(hash) {
    window.location.hash = hash;
  }

  current() {
    return window.location.hash.slice(1) || 'welcome';
  }

  _resolve() {
    const hash = this.current();

    // Find matching route (support params like contribute/:id)
    let handler = this._routes[hash];
    let params = {};

    if (!handler) {
      for (const [pattern, h] of Object.entries(this._routes)) {
        const regex = new RegExp(
          '^' + pattern.replace(/:([^/]+)/g, '(?<$1>[^/]+)') + '$'
        );
        const match = hash.match(regex);
        if (match) {
          handler = h;
          params = match.groups || {};
          break;
        }
      }
    }

    if (!handler) {
      handler = this._routes['welcome'] || this._routes[''];
    }

    if (!this._appEl) return;

    // Cleanup previous view
    if (this._currentCleanup) {
      this._currentCleanup();
      this._currentCleanup = null;
    }

    this._appEl.innerHTML = '';
    if (handler) {
      this._currentCleanup = handler(this._appEl, params) || null;
    }
  }
}

export const router = new Router();
