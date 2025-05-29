export { sandboxEvents, checkStorageQuota } from './events';
export type { SandboxEvents, SandboxEventType } from './events';
export interface Sandbox {
    id: string;
    html: string;
    meta?: Record<string, any>;
    createdAt: Date;
    lastAccessed?: Date;
}
/**
 * Creates a new sandbox or updates an existing one if the HTML content is the same.
 * The ID of the sandbox is a content hash of its HTML.
 * @param html The HTML content of the sandbox.
 * @param meta Optional metadata to store with the sandbox.
 * @returns The ID (hash) of the created or existing sandbox.
 */
export declare function create(html: string, meta?: Record<string, any>): Promise<string>;
/**
 * Lists all stored sandboxes.
 * @returns A promise that resolves to an array of Sandbox objects.
 */
export declare function list(): Promise<Sandbox[]>;
/**
 * Retrieves a specific sandbox by its ID (hash).
 * @param id The ID (hash) of the sandbox.
 * @returns A promise that resolves to the Sandbox object or undefined if not found.
 */
export declare function get(id: string): Promise<Sandbox | undefined>;
/**
 * Destroys (deletes) a sandbox by its ID (hash).
 * @param id The ID (hash) of the sandbox to destroy.
 * @returns A promise that resolves when the sandbox is deleted.
 */
export declare function destroy(id: string): Promise<void>;
/**
 * Runs a sandbox in an iframe within the specified container element.
 * @param id The ID (hash) of the sandbox to run.
 * @param containerElement The DOM element to contain the iframe.
 * @returns A promise that resolves when the sandbox is loaded.
 */
export declare function run(id: string, containerElement: HTMLElement): Promise<void>;
/**
 * Stops a running sandbox by removing its iframe.
 * @param id The ID (hash) of the sandbox to stop.
 */
export declare function stop(id: string): void;
/**
 * Pauses a running sandbox (hides iframe).
 * @param id The ID (hash) of the sandbox to pause.
 */
export declare function pause(id: string): void;
/**
 * Resumes a paused sandbox (shows iframe).
 * @param id The ID (hash) of the sandbox to resume.
 */
export declare function resume(id: string): void;
/**
 * Gets the list of currently active (running) sandboxes.
 * @returns Array of active sandbox IDs and their status.
 */
export declare function getActiveSandboxes(): Array<{
    id: string;
    status: string;
    meta?: Record<string, any>;
}>;
/**
 * Utility function to get the hash of HTML content.
 * @param htmlContent The HTML content to hash.
 * @returns The content hash.
 */
export declare function getHash(htmlContent: string): Promise<string>;
