// Firebase Modular SDK via CDN — ES Module imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  doc,
  setDoc,
  getDocFromCache,
  getDocFromServer,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpsWZq_-haDubCM_xq9JSgt0_P3hPSFng",
  authDomain: "gen-lang-client-0144819436.firebaseapp.com",
  projectId: "gen-lang-client-0144819436",
  storageBucket: "gen-lang-client-0144819436.firebasestorage.app",
  messagingSenderId: "67665396784",
  appId: "1:67665396784:web:1c9dd961870668964319f5"
};

let db = null;
let auth = null;
let _initialized = false;
let _authReady = null; // Promise that resolves when auth is done

function isConfigured() {
  return firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY";
}

// --- Initialize ---

export function initFirebase() {
  if (_initialized) return { db, auth };
  if (!isConfigured()) {
    console.warn('[moments] Firebase not configured — running in offline-only mode.');
    return { db: null, auth: null };
  }

  try {
    const app = initializeApp(firebaseConfig);

    // Firestore with IndexedDB persistence for offline / cache-first reads
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() })
    }, "ai-studio-5840958f-eaaf-44d6-9794-47aec37691ec");

    // Anonymous auth so Firestore security rules can identify the user
    auth = getAuth(app);
    _authReady = signInAnonymously(auth)
      .then(() => console.log('[moments] Auth ready'))
      .catch(e => console.warn('[moments] Auth failed:', e.message));

    _initialized = true;
  } catch (e) {
    console.warn('[moments] Firebase init failed:', e.message);
  }

  return { db, auth };
}

export function isFirebaseReady() {
  return _initialized && db !== null;
}

// Wait for auth before making Firestore calls that need it
async function ensureAuth() {
  if (_authReady) await _authReady;
}

// --- Step 2: Create a new gift jar ---

export async function createGiftJar(codeId, creatorName, recipientName, recipientType, messages) {
  if (!isFirebaseReady()) return false;
  await ensureAuth();
  try {
    const giftRef = doc(db, "gifts", codeId);
    await setDoc(giftRef, {
      code_id: codeId,
      creator_name: creatorName,
      recipient_name: recipientName,
      recipient_type: recipientType || '',
      created_at: new Date(),
      messages: messages || []
    });
    console.log(`[moments] Jar created: ${codeId}`);
    return true;
  } catch (e) {
    console.warn('[moments] Failed to create gift jar:', e.message);
    return false;
  }
}

// --- Step 3: Add a message via arrayUnion (crowdsourcing) ---

export async function addMessage(codeId, authorName, content) {
  if (!isFirebaseReady()) return null;
  await ensureAuth();
  try {
    const giftRef = doc(db, "gifts", codeId.toUpperCase());
    const uniqueMessageId = crypto.randomUUID();

    const newMessage = {
      message_id: uniqueMessageId,
      author: authorName,
      content: content,
      added_at: new Date()
    };

    await updateDoc(giftRef, {
      messages: arrayUnion(newMessage)
    });

    console.log('[moments] Message added:', uniqueMessageId);
    return uniqueMessageId;
  } catch (e) {
    console.warn('[moments] Failed to add message:', e.message);
    return null;
  }
}

// --- Step 4: Cache-first read strategy ---

export async function fetchGiftJar(codeId) {
  if (!isFirebaseReady()) return null;
  await ensureAuth();

  const upperCode = codeId.toUpperCase();
  const giftRef = doc(db, "gifts", upperCode);

  try {
    // 1. Try the local IndexedDB cache first (zero cost, instant)
    const cachedSnap = await getDocFromCache(giftRef);

    if (cachedSnap.exists()) {
      console.log(`[moments] Jar ${upperCode} loaded from cache`);
      // Background sync: quietly check server for updates
      getDocFromServer(giftRef).catch(() => {});
      return cachedSnap.data();
    }
  } catch (_cacheErr) {
    // Not in cache — expected on first load
  }

  // 2. Fallback: fetch from server (costs 1 read)
  try {
    console.log(`[moments] Jar ${upperCode} not cached, fetching from server...`);
    const serverSnap = await getDocFromServer(giftRef);
    if (serverSnap.exists()) {
      console.log(`[moments] Jar ${upperCode} found on server`);
      return serverSnap.data();
    } else {
      console.log(`[moments] Jar ${upperCode} does not exist on server`);
    }
  } catch (serverErr) {
    console.warn(`[moments] Failed to fetch jar ${upperCode}:`, serverErr.message);
    const msg = serverErr.message || '';
    if (msg.includes('offline') || msg.includes('not-found') || msg.includes('Failed to get document')) {
      throw new Error('offline');
    }
  }

  return null;
}

// --- Utility: get random moment from multiple unlocked jars ---

export async function getRandomMoment(unlockedCodesArray) {
  if (!isFirebaseReady()) return null;
  if (!unlockedCodesArray || unlockedCodesArray.length === 0) return null;

  let allMessages = [];

  for (const code of unlockedCodesArray) {
    const data = await fetchGiftJar(code);
    if (data && data.messages) {
      allMessages.push(...data.messages);
    }
  }

  if (allMessages.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * allMessages.length);
  return allMessages[randomIndex];
}
