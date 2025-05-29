// Event system for SandboxManager SDK
class SandboxEventEmitter extends EventTarget {
    constructor() {
        super(...arguments);
        this.logPrefix = '[SandboxManager Events]';
    }
    /**
     * Emits a sandbox-related event
     */
    emit(type, detail) {
        console.log(`${this.logPrefix} Emitting event '${type}':`, detail);
        const event = new CustomEvent(type, { detail });
        this.dispatchEvent(event);
    }
    /**
     * Adds an event listener for a specific sandbox event type
     */
    on(type, listener, options) {
        console.log(`${this.logPrefix} Adding listener for event '${type}'`);
        this.addEventListener(type, listener, options);
    }
    /**
     * Removes an event listener for a specific sandbox event type
     */
    off(type, listener, options) {
        console.log(`${this.logPrefix} Removing listener for event '${type}'`);
        this.removeEventListener(type, listener, options);
    }
    /**
     * Adds a one-time event listener
     */
    once(type, listener) {
        console.log(`${this.logPrefix} Adding one-time listener for event '${type}'`);
        this.on(type, listener, { once: true });
    }
}
// Singleton event emitter instance
export const sandboxEvents = new SandboxEventEmitter();
// Storage quota monitoring
export async function checkStorageQuota() {
    try {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            const used = estimate.usage || 0;
            const quota = estimate.quota || 0;
            const percentage = quota > 0 ? (used / quota) * 100 : 0;
            console.log(`[SandboxManager Storage] Used: ${(used / 1024 / 1024).toFixed(2)}MB, Quota: ${(quota / 1024 / 1024).toFixed(2)}MB, Percentage: ${percentage.toFixed(1)}%`);
            // Emit warning if storage is getting full
            if (percentage > 80) {
                sandboxEvents.emit('storageQuota', { used, quota, percentage });
                console.warn(`[SandboxManager Storage] Storage quota warning: ${percentage.toFixed(1)}% used`);
            }
        }
        else {
            console.warn('[SandboxManager Storage] Storage estimation API not available');
        }
    }
    catch (error) {
        console.error('[SandboxManager Storage] Error checking storage quota:', error);
        sandboxEvents.emit('error', {
            id: 'storage-check',
            error: error,
            context: 'Storage quota check failed'
        });
    }
}
console.log('[SandboxManager Events] Event system initialized');
