export interface SandboxEvents {
    loaded: {
        id: string;
        meta?: Record<string, any>;
    };
    error: {
        id: string;
        error: Error;
        context?: string;
    };
    storageQuota: {
        used: number;
        quota: number;
        percentage: number;
    };
    created: {
        id: string;
        meta?: Record<string, any>;
    };
    destroyed: {
        id: string;
    };
    paused: {
        id: string;
    };
    resumed: {
        id: string;
    };
}
export type SandboxEventType = keyof SandboxEvents;
declare class SandboxEventEmitter extends EventTarget {
    private logPrefix;
    /**
     * Emits a sandbox-related event
     */
    emit<K extends SandboxEventType>(type: K, detail: SandboxEvents[K]): void;
    /**
     * Adds an event listener for a specific sandbox event type
     */
    on<K extends SandboxEventType>(type: K, listener: (event: CustomEvent<SandboxEvents[K]>) => void, options?: AddEventListenerOptions): void;
    /**
     * Removes an event listener for a specific sandbox event type
     */
    off<K extends SandboxEventType>(type: K, listener: (event: CustomEvent<SandboxEvents[K]>) => void, options?: EventListenerOptions): void;
    /**
     * Adds a one-time event listener
     */
    once<K extends SandboxEventType>(type: K, listener: (event: CustomEvent<SandboxEvents[K]>) => void): void;
}
export declare const sandboxEvents: SandboxEventEmitter;
export declare function checkStorageQuota(): Promise<void>;
export {};
