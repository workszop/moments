// Firebase Modular SDK via CDN — ES Module imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Replace these values with your own Firebase project config
// from https://console.firebase.google.com → Project Settings → Your apps
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let db = null;
let auth = null;
let _initialized = false;

function isConfigured() {
  return firebaseConfig.apiKey !== "YOUR_API_KEY";
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
    });

    // Anonymous auth so Firestore security rules can identify the user
    auth = getAuth(app);
    signInAnonymously(auth).catch(() => {});

    _initialized = true;
  } catch (e) {
    console.warn('[moments] Firebase init failed:', e.message);
  }

  return { db, auth };
}

export function isFirebaseReady() {
  return _initialized && db !== null;
}

// --- Step 2: Create a new gift jar ---

export async function createGiftJar(codeId, creatorName, recipientName, recipientType, messages) {
  if (!isFirebaseReady()) return false;
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
    return true;
  } catch (e) {
    console.warn('[moments] Failed to create gift jar:', e.message);
    return false;
  }
}

// --- Step 3: Add a message via arrayUnion (crowdsourcing) ---

export async function addMessage(codeId, authorName, content) {
  if (!isFirebaseReady()) return null;
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

    return uniqueMessageId;
  } catch (e) {
    console.warn('[moments] Failed to add message:', e.message);
    return null;
  }
}

// --- Step 4: Cache-first read strategy ---

export async function fetchGiftJar(codeId) {
  if (!isFirebaseReady()) return null;

  const giftRef = doc(db, "gifts", codeId.toUpperCase());

  try {
    // 1. Try the local IndexedDB cache first (zero cost, instant)
    const cachedSnap = await getDoc(giftRef, { source: 'cache' });

    if (cachedSnap.exists()) {
      // Background sync: quietly check server for updates
      getDoc(giftRef, { source: 'server' }).catch(() => {});
      return cachedSnap.data();
    } else {
      throw new Error("Not in cache");
    }
  } catch (_cacheErr) {
    // 2. Fallback: fetch from server (costs 1 read)
    try {
      const serverSnap = await getDoc(giftRef, { source: 'server' });
      if (serverSnap.exists()) {
        return serverSnap.data();
      }
    } catch (serverErr) {
      console.warn(`[moments] Failed to fetch jar ${codeId}. User might be offline.`, serverErr.message);
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
