// Event system for SandboxManager SDK

export interface SandboxEvents {
  loaded: { id: string; meta?: Record<string, any> };
  error: { id: string; error: Error; context?: string };
  storageQuota: { used: number; quota: number; percentage: number };
  created: { id: string; meta?: Record<string, any> };
  destroyed: { id: string };
  paused: { id: string };
  resumed: { id: string };
}

export type SandboxEventType = keyof SandboxEvents;

class SandboxEventEmitter extends EventTarget {
  private logPrefix = '[SandboxManager Events]';

  /**
   * Emits a sandbox-related event
   */
  emit<K extends SandboxEventType>(type: K, detail: SandboxEvents[K]): void {
    console.log(`${this.logPrefix} Emitting event '${type}':`, detail);
    
    const event = new CustomEvent(type, { detail });
    this.dispatchEvent(event);
  }

  /**
   * Adds an event listener for a specific sandbox event type
   */
  on<K extends SandboxEventType>(
    type: K,
    listener: (event: CustomEvent<SandboxEvents[K]>) => void,
    options?: AddEventListenerOptions
  ): void {
    console.log(`${this.logPrefix} Adding listener for event '${type}'`);
    this.addEventListener(type, listener as EventListener, options);
  }

  /**
   * Removes an event listener for a specific sandbox event type
   */
  off<K extends SandboxEventType>(
    type: K,
    listener: (event: CustomEvent<SandboxEvents[K]>) => void,
    options?: EventListenerOptions
  ): void {
    console.log(`${this.logPrefix} Removing listener for event '${type}'`);
    this.removeEventListener(type, listener as EventListener, options);
  }

  /**
   * Adds a one-time event listener
   */
  once<K extends SandboxEventType>(
    type: K,
    listener: (event: CustomEvent<SandboxEvents[K]>) => void
  ): void {
    console.log(`${this.logPrefix} Adding one-time listener for event '${type}'`);
    this.on(type, listener, { once: true });
  }
}

// Singleton event emitter instance
export const sandboxEvents = new SandboxEventEmitter();

// Storage quota monitoring
export async function checkStorageQuota(): Promise<void> {
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
    } else {
      console.warn('[SandboxManager Storage] Storage estimation API not available');
    }
  } catch (error) {
    console.error('[SandboxManager Storage] Error checking storage quota:', error);
    sandboxEvents.emit('error', { 
      id: 'storage-check', 
      error: error as Error, 
      context: 'Storage quota check failed' 
    });
  }
}

console.log('[SandboxManager Events] Event system initialized'); 