import { DEMO_ACCESS_CODES, DEMO_MESSAGES } from './data.js';

const STORAGE_KEY = 'moments_store';
const FLIPS_PER_WINDOW = 3;
const FLIP_WINDOW_MS = 60 * 60 * 1000; // 1 hour

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
    privateEntries: [],
    createdGifts: [],
    seenToday: [],
    lastSeenDate: null,
    flipCount: 0,
    flipWindowStart: null,
    privateVaultActive: true
  };
}

class Store {
  constructor() {
    this._listeners = [];
    this._state = loadState() || createDefaultState();
    if (this._state.flipCount === undefined) this._state.flipCount = 0;
    if (this._state.flipWindowStart === undefined) this._state.flipWindowStart = null;
    if (this._state.privateVaultActive === undefined) this._state.privateVaultActive = true;
    this._seedDemoIfNeeded();
  }

  _seedDemoIfNeeded() {
    const hasDemo = this._state.accessCodes.some(c => c.code_id === 'ART-101');
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

  getAllCodes() {
    return this._state.accessCodes;
  }

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

  toggleCode(codeId) {
    const code = this.findCode(codeId);
    if (code) {
      code.is_active = !code.is_active;
      this._notify();
    }
  }

  deleteCode(codeId) {
    this._state.accessCodes = this._state.accessCodes.filter(
      c => c.code_id.toUpperCase() !== codeId.toUpperCase()
    );
    this._state.messages = this._state.messages.filter(
      m => m.code_id.toUpperCase() !== codeId.toUpperCase()
    );
    this._notify();
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
    const private_ = this._state.privateVaultActive ? this._state.privateEntries : [];
    return [...codeMessages, ...private_];
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

  // --- Flip Limiting ---

  _resetFlipWindowIfNeeded() {
    if (!this._state.flipWindowStart) return;
    const elapsed = Date.now() - this._state.flipWindowStart;
    if (elapsed >= FLIP_WINDOW_MS) {
      this._state.flipCount = 0;
      this._state.flipWindowStart = null;
      this._persist();
    }
  }

  canFlip() {
    this._resetFlipWindowIfNeeded();
    return this._state.flipCount < FLIPS_PER_WINDOW;
  }

  flipsRemaining() {
    this._resetFlipWindowIfNeeded();
    return Math.max(0, FLIPS_PER_WINDOW - this._state.flipCount);
  }

  recordFlip() {
    this._resetFlipWindowIfNeeded();
    if (!this._state.flipWindowStart) {
      this._state.flipWindowStart = Date.now();
    }
    this._state.flipCount++;
    this._persist();
  }

  getTimeUntilNextFlip() {
    if (!this._state.flipWindowStart) return 0;
    const elapsed = Date.now() - this._state.flipWindowStart;
    return Math.max(0, FLIP_WINDOW_MS - elapsed);
  }

  // --- Private Vault ---

  isPrivateVaultActive() {
    return this._state.privateVaultActive !== false;
  }

  togglePrivateVault() {
    this._state.privateVaultActive = !this.isPrivateVaultActive();
    this._notify();
  }

  addPrivateEntry(content) {
    const entry = {
      message_id: 'priv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      code_id: 'PRIVATE',
      author: 'you',
      content
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
