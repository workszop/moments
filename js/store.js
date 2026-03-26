import { DEMO_ACCESS_CODES, DEMO_MESSAGES } from './data.js';

const STORAGE_KEY = 'moments_store';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return null;
}

function createDefaultState() {
  return {
    accessCodes: [],
    messages: [],
    favorites: [],
    privateEntries: [],
    createdGifts: [],
    seenToday: [],
    lastSeenDate: null
  };
}

class Store {
  constructor() {
    this._listeners = [];
    this._state = loadState() || createDefaultState();
    this._seedDemoIfNeeded();
  }

  _seedDemoIfNeeded() {
    const hasDemo = this._state.accessCodes.some(c => c.code_id === 'DEMO-LOVE-2026');
    if (!hasDemo) {
      this._state.accessCodes.push(...DEMO_ACCESS_CODES);
      this._state.messages.push(...DEMO_MESSAGES);
      this._persist();
    }
  }

  _persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));
    } catch (e) { /* quota exceeded */ }
  }

  _notify() {
    this._persist();
    this._listeners.forEach(fn => fn(this._state));
  }

  subscribe(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter(l => l !== fn);
    };
  }

  get state() {
    return this._state;
  }

  // --- Codes ---

  getUnlockedCodes() {
    return this._state.accessCodes.filter(c => c.is_active);
  }

  findCode(codeId) {
    return this._state.accessCodes.find(
      c => c.code_id.toUpperCase() === codeId.toUpperCase()
    );
  }

  unlockCode(codeId) {
    const existing = this.findCode(codeId);
    if (existing) {
      existing.is_active = true;
      this._notify();
      return existing;
    }
    return null;
  }

  hasAnyCodes() {
    return this._state.accessCodes.some(c => c.is_active);
  }

  // --- Messages ---

  getMessagesForCode(codeId) {
    return this._state.messages.filter(
      m => m.code_id.toUpperCase() === codeId.toUpperCase()
    );
  }

  getAllActiveMessages() {
    const activeCodes = new Set(
      this.getUnlockedCodes().map(c => c.code_id.toUpperCase())
    );
    const codeMessages = this._state.messages.filter(
      m => activeCodes.has(m.code_id.toUpperCase())
    );
    return [...codeMessages, ...this._state.privateEntries];
  }

  getShuffledFeed() {
    const today = new Date().toDateString();
    if (this._state.lastSeenDate !== today) {
      this._state.seenToday = [];
      this._state.lastSeenDate = today;
    }

    const all = this.getAllActiveMessages();
    const unseen = all.filter(m => !this._state.seenToday.includes(m.message_id));
    const pool = unseen.length > 0 ? unseen : all;

    // Fisher-Yates shuffle
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  markSeen(messageId) {
    if (!this._state.seenToday.includes(messageId)) {
      this._state.seenToday.push(messageId);
      this._persist();
    }
  }

  // --- Favorites ---

  toggleFavorite(messageId) {
    const idx = this._state.favorites.indexOf(messageId);
    if (idx === -1) {
      this._state.favorites.push(messageId);
    } else {
      this._state.favorites.splice(idx, 1);
    }
    this._notify();
  }

  isFavorite(messageId) {
    return this._state.favorites.includes(messageId);
  }

  getFavoriteMessages() {
    const all = [...this._state.messages, ...this._state.privateEntries];
    return all.filter(m => this._state.favorites.includes(m.message_id));
  }

  // --- Private Vault ---

  addPrivateEntry(content) {
    const entry = {
      message_id: 'priv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      code_id: 'PRIVATE',
      author: 'you',
      content,
      type: 'private_thought'
    };
    this._state.privateEntries.push(entry);
    this._notify();
    return entry;
  }

  getPrivateEntries() {
    return this._state.privateEntries;
  }
}

export const store = new Store();
