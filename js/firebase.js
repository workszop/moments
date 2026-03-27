// Firebase configuration
// Replace these values with your own Firebase project config
// from https://console.firebase.google.com → Project Settings → Your apps
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let db = null;
let auth = null;
let _initialized = false;

function isConfigured() {
  return firebaseConfig.apiKey !== "YOUR_API_KEY";
}

export function initFirebase() {
  if (_initialized) return { db, auth };
  if (!isConfigured()) {
    console.warn('[moments] Firebase not configured — running in offline-only mode.');
    return { db: null, auth: null };
  }

  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();

    // Enable offline persistence
    db.enablePersistence({ synchronizeTabs: true }).catch(() => {});

    // Sign in anonymously so Firestore rules can identify users
    auth.signInAnonymously().catch(() => {});

    _initialized = true;
  } catch (e) {
    console.warn('[moments] Firebase init failed:', e.message);
  }

  return { db, auth };
}

export function getDb() { return db; }
export function getAuth() { return auth; }
export function isFirebaseReady() { return _initialized && db !== null; }

// --- Firestore helpers ---

export async function saveGiftToCloud(giftData) {
  if (!isFirebaseReady()) return false;
  try {
    const docRef = db.collection('gifts').doc(giftData.code_id);
    await docRef.set({
      code_id: giftData.code_id,
      creator_name: giftData.creator_name,
      recipient_name: giftData.recipient_name,
      recipient_type: giftData.recipient_type || '',
      messages: giftData.messages || [],
      created_at: firebase.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (e) {
    console.warn('[moments] Failed to save gift:', e.message);
    return false;
  }
}

export async function fetchGiftFromCloud(codeId) {
  if (!isFirebaseReady()) return null;
  try {
    const doc = await db.collection('gifts').doc(codeId.toUpperCase()).get();
    if (!doc.exists) return null;
    return doc.data();
  } catch (e) {
    console.warn('[moments] Failed to fetch gift:', e.message);
    return null;
  }
}

export async function addMessageToCloud(codeId, message) {
  if (!isFirebaseReady()) return false;
  try {
    const docRef = db.collection('gifts').doc(codeId.toUpperCase());
    await docRef.update({
      messages: firebase.firestore.FieldValue.arrayUnion(message)
    });
    return true;
  } catch (e) {
    console.warn('[moments] Failed to add message:', e.message);
    return false;
  }
}
