import { openDB } from 'idb';
const DB_NAME = 'BigBoxSandboxes';
const DB_VERSION = 1;
const STORE_NAME = 'sandboxes';
let dbPromise = null;
function getDB() {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion, newVersion, transaction) {
                console.log(`Upgrading DB from ${oldVersion} to ${newVersion}`);
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'hash' });
                    store.createIndex('createdAt', 'createdAt');
                    console.log(`Object store '${STORE_NAME}' created.`);
                }
                // Future migrations can go here based on oldVersion
            },
            blocked() {
                console.error('IndexedDB access is blocked. Close other tabs?');
                // Potentially inform the user or attempt to close/reopen
                // For now, we'll just reject the promise
                dbPromise = null; // Reset promise
                return Promise.reject(new Error('IndexedDB blocked'));
            },
            blocking() {
                console.warn('IndexedDB is blocking other connections. DB will be closed.');
                // This event means another tab/window is trying to upgrade the DB
                // and this one is blocking it. The DB should be closed.
                dbPromise = null; // Reset promise to allow re-opening
            },
            terminated() {
                console.error('IndexedDB connection terminated unexpectedly.');
                dbPromise = null; // Reset promise
            }
        });
    }
    return dbPromise;
}
// Basic CRUD operations will follow
export async function addSandbox(hash, html, meta) {
    const db = await getDB();
    const record = {
        hash,
        html,
        meta,
        createdAt: new Date(),
    };
    await db.put(STORE_NAME, record);
    console.log(`Sandbox ${hash} added/updated in DB.`);
    return hash;
}
export async function getSandbox(hash) {
    const db = await getDB();
    const record = await db.get(STORE_NAME, hash);
    if (record) {
        // Update lastAccessed time (optional, could be a separate function or trigger)
        record.lastAccessed = new Date();
        await db.put(STORE_NAME, record);
    }
    return record;
}
export async function listSandboxes() {
    const db = await getDB();
    return db.getAll(STORE_NAME);
}
export async function deleteSandbox(hash) {
    const db = await getDB();
    await db.delete(STORE_NAME, hash);
    console.log(`Sandbox ${hash} deleted from DB.`);
}
// Placeholder for content hashing - to be implemented
// For now, the caller must provide the hash.
export async function calculateHash(htmlContent) {
    // In a real implementation, use something like SHA-256
    // For now, a very simple placeholder:
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(htmlContent);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }
    else {
        // Fallback for environments without crypto.subtle (e.g. some test runners or older node without DOM lib for crypto)
        console.warn('crypto.subtle not available for SHA-256 hashing. Using simple length-based hash.');
        return `simplehash-${htmlContent.length}`;
    }
}
console.log('db.ts loaded');
