import { addSandbox as dbAddSandbox, getSandbox as dbGetSandbox, listSandboxes as dbListSandboxes, deleteSandbox as dbDeleteSandbox, calculateHash as dbCalculateHash,
// We might not expose SandboxRecord directly, or rename it for the public API
 } from './db';
import { sandboxEvents, checkStorageQuota } from './events';
// Re-export event system for consumers
export { sandboxEvents, checkStorageQuota } from './events';
console.log("[SandboxManager SDK] Loading SandboxManager SDK v0.1.0");
const activeSandboxes = new Map();
/**
 * Creates a new sandbox or updates an existing one if the HTML content is the same.
 * The ID of the sandbox is a content hash of its HTML.
 * @param html The HTML content of the sandbox.
 * @param meta Optional metadata to store with the sandbox.
 * @returns The ID (hash) of the created or existing sandbox.
 */
export async function create(html, meta) {
    console.log("[SandboxManager] Starting create process...");
    console.log(`[SandboxManager] HTML content length: ${html.length} characters`);
    console.log(`[SandboxManager] Meta provided:`, meta);
    try {
        const hash = await dbCalculateHash(html);
        console.log(`[SandboxManager] Calculated content hash: ${hash}`);
        const existing = await dbGetSandbox(hash);
        if (existing) {
            console.log(`[SandboxManager] Sandbox with hash ${hash} already exists`);
            console.log(`[SandboxManager] Existing sandbox created at:`, existing.createdAt);
            // Update metadata if provided
            if (meta) {
                console.log(`[SandboxManager] Updating metadata for existing sandbox ${hash}`);
                await dbAddSandbox(hash, html, meta);
            }
            // Emit created event for existing sandbox update
            sandboxEvents.emit('created', { id: hash, meta: meta || existing.meta });
            // Check storage quota
            await checkStorageQuota();
            return hash;
        }
        console.log(`[SandboxManager] Creating new sandbox with hash ${hash}`);
        await dbAddSandbox(hash, html, meta);
        console.log(`[SandboxManager] Sandbox ${hash} successfully stored in IndexedDB`);
        // Emit created event
        sandboxEvents.emit('created', { id: hash, meta });
        // Check storage quota after creation
        await checkStorageQuota();
        return hash;
    }
    catch (error) {
        console.error("[SandboxManager] Error in create function:", error);
        sandboxEvents.emit('error', {
            id: 'create-failed',
            error: error,
            context: 'Failed to create sandbox'
        });
        throw error;
    }
}
/**
 * Lists all stored sandboxes.
 * @returns A promise that resolves to an array of Sandbox objects.
 */
export async function list() {
    console.log("[SandboxManager] Listing all sandboxes from IndexedDB...");
    try {
        const records = await dbListSandboxes();
        console.log(`[SandboxManager] Found ${records.length} sandboxes in storage`);
        // Map from DB record to public Sandbox interface
        const sandboxes = records.map(record => {
            console.log(`[SandboxManager] Mapping sandbox ${record.hash}:`, {
                created: record.createdAt,
                lastAccessed: record.lastAccessed,
                hasHtml: !!record.html,
                hasMeta: !!record.meta
            });
            return {
                id: record.hash,
                html: record.html,
                meta: record.meta,
                createdAt: record.createdAt,
                lastAccessed: record.lastAccessed
            };
        });
        return sandboxes;
    }
    catch (error) {
        console.error("[SandboxManager] Error listing sandboxes:", error);
        sandboxEvents.emit('error', {
            id: 'list-failed',
            error: error,
            context: 'Failed to list sandboxes'
        });
        throw error;
    }
}
/**
 * Retrieves a specific sandbox by its ID (hash).
 * @param id The ID (hash) of the sandbox.
 * @returns A promise that resolves to the Sandbox object or undefined if not found.
 */
export async function get(id) {
    console.log(`[SandboxManager] Getting sandbox with ID: ${id}`);
    try {
        const record = await dbGetSandbox(id);
        if (record) {
            console.log(`[SandboxManager] Found sandbox ${id}:`, {
                created: record.createdAt,
                lastAccessed: record.lastAccessed,
                htmlLength: record.html.length,
                metaKeys: record.meta ? Object.keys(record.meta) : []
            });
            return {
                id: record.hash,
                html: record.html,
                meta: record.meta,
                createdAt: record.createdAt,
                lastAccessed: record.lastAccessed
            };
        }
        else {
            console.log(`[SandboxManager] Sandbox ${id} not found in storage`);
            return undefined;
        }
    }
    catch (error) {
        console.error(`[SandboxManager] Error getting sandbox ${id}:`, error);
        sandboxEvents.emit('error', {
            id,
            error: error,
            context: 'Failed to retrieve sandbox'
        });
        throw error;
    }
}
/**
 * Destroys (deletes) a sandbox by its ID (hash).
 * @param id The ID (hash) of the sandbox to destroy.
 * @returns A promise that resolves when the sandbox is deleted.
 */
export async function destroy(id) {
    console.log(`[SandboxManager] Destroying sandbox with ID: ${id}`);
    try {
        // Stop running sandbox if active
        if (activeSandboxes.has(id)) {
            console.log(`[SandboxManager] Stopping active sandbox ${id} before destruction`);
            stop(id);
        }
        await dbDeleteSandbox(id);
        console.log(`[SandboxManager] Sandbox ${id} successfully deleted from IndexedDB`);
        // Emit destroyed event
        sandboxEvents.emit('destroyed', { id });
        // Check storage quota after deletion
        await checkStorageQuota();
    }
    catch (error) {
        console.error(`[SandboxManager] Error destroying sandbox ${id}:`, error);
        sandboxEvents.emit('error', {
            id,
            error: error,
            context: 'Failed to destroy sandbox'
        });
        throw error;
    }
}
/**
 * Runs a sandbox in an iframe within the specified container element.
 * @param id The ID (hash) of the sandbox to run.
 * @param containerElement The DOM element to contain the iframe.
 * @returns A promise that resolves when the sandbox is loaded.
 */
export async function run(id, containerElement) {
    console.log(`[SandboxManager] Starting to run sandbox ${id}`);
    console.log(`[SandboxManager] Container element:`, containerElement.tagName, containerElement.className);
    try {
        // Check if sandbox is already running
        if (activeSandboxes.has(id)) {
            console.warn(`[SandboxManager] Sandbox ${id} is already running`);
            return;
        }
        // Get sandbox data from storage
        console.log(`[SandboxManager] Fetching sandbox ${id} from storage...`);
        const sandbox = await get(id);
        if (!sandbox) {
            throw new Error(`Sandbox ${id} not found in storage`);
        }
        console.log(`[SandboxManager] Retrieved sandbox ${id}, HTML length: ${sandbox.html.length}`);
        // Create iframe element
        const iframe = document.createElement('iframe');
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        console.log(`[SandboxManager] Created iframe for sandbox ${id} with security sandbox attributes`);
        // Track as loading
        const activeSandbox = {
            id,
            iframe,
            container: containerElement,
            status: 'loading',
            meta: sandbox.meta
        };
        activeSandboxes.set(id, activeSandbox);
        // Set up iframe event handlers
        iframe.onload = () => {
            console.log(`[SandboxManager] Iframe loaded successfully for sandbox ${id}`);
            activeSandbox.status = 'loaded';
            sandboxEvents.emit('loaded', { id, meta: sandbox.meta });
        };
        iframe.onerror = (error) => {
            console.error(`[SandboxManager] Iframe error for sandbox ${id}:`, error);
            activeSandbox.status = 'error';
            sandboxEvents.emit('error', {
                id,
                error: new Error('Iframe failed to load'),
                context: 'Iframe load error'
            });
        };
        // Set iframe content and append to container
        console.log(`[SandboxManager] Setting iframe srcdoc for sandbox ${id}`);
        iframe.srcdoc = sandbox.html;
        console.log(`[SandboxManager] Appending iframe to container for sandbox ${id}`);
        containerElement.appendChild(iframe);
        console.log(`[SandboxManager] Sandbox ${id} iframe setup complete`);
    }
    catch (error) {
        console.error(`[SandboxManager] Error running sandbox ${id}:`, error);
        sandboxEvents.emit('error', {
            id,
            error: error,
            context: 'Failed to run sandbox'
        });
        throw error;
    }
}
/**
 * Stops a running sandbox by removing its iframe.
 * @param id The ID (hash) of the sandbox to stop.
 */
export function stop(id) {
    console.log(`[SandboxManager] Stopping sandbox ${id}`);
    const activeSandbox = activeSandboxes.get(id);
    if (!activeSandbox) {
        console.warn(`[SandboxManager] Sandbox ${id} is not currently running`);
        return;
    }
    console.log(`[SandboxManager] Removing iframe for sandbox ${id}`);
    if (activeSandbox.iframe.parentNode) {
        activeSandbox.iframe.parentNode.removeChild(activeSandbox.iframe);
    }
    activeSandboxes.delete(id);
    console.log(`[SandboxManager] Sandbox ${id} stopped and removed from active sandboxes`);
}
/**
 * Pauses a running sandbox (hides iframe).
 * @param id The ID (hash) of the sandbox to pause.
 */
export function pause(id) {
    console.log(`[SandboxManager] Pausing sandbox ${id}`);
    const activeSandbox = activeSandboxes.get(id);
    if (!activeSandbox) {
        console.warn(`[SandboxManager] Sandbox ${id} is not currently running`);
        return;
    }
    activeSandbox.iframe.style.display = 'none';
    activeSandbox.status = 'paused';
    console.log(`[SandboxManager] Sandbox ${id} paused (iframe hidden)`);
    sandboxEvents.emit('paused', { id });
}
/**
 * Resumes a paused sandbox (shows iframe).
 * @param id The ID (hash) of the sandbox to resume.
 */
export function resume(id) {
    console.log(`[SandboxManager] Resuming sandbox ${id}`);
    const activeSandbox = activeSandboxes.get(id);
    if (!activeSandbox) {
        console.warn(`[SandboxManager] Sandbox ${id} is not currently running`);
        return;
    }
    if (activeSandbox.status !== 'paused') {
        console.warn(`[SandboxManager] Sandbox ${id} is not paused (current status: ${activeSandbox.status})`);
        return;
    }
    activeSandbox.iframe.style.display = '';
    activeSandbox.status = 'loaded';
    console.log(`[SandboxManager] Sandbox ${id} resumed (iframe shown)`);
    sandboxEvents.emit('resumed', { id });
}
/**
 * Gets the list of currently active (running) sandboxes.
 * @returns Array of active sandbox IDs and their status.
 */
export function getActiveSandboxes() {
    console.log(`[SandboxManager] Getting active sandboxes (${activeSandboxes.size} active)`);
    return Array.from(activeSandboxes.entries()).map(([id, sandbox]) => ({
        id,
        status: sandbox.status,
        meta: sandbox.meta
    }));
}
/**
 * Utility function to get the hash of HTML content.
 * @param htmlContent The HTML content to hash.
 * @returns The content hash.
 */
export async function getHash(htmlContent) {
    console.log(`[SandboxManager] Calculating hash for HTML content (${htmlContent.length} chars)`);
    const hash = await dbCalculateHash(htmlContent);
    console.log(`[SandboxManager] Generated hash: ${hash}`);
    return hash;
}
// Initialize storage quota monitoring
console.log("[SandboxManager SDK] Initializing storage quota monitoring...");
checkStorageQuota().catch(error => {
    console.error("[SandboxManager SDK] Initial storage quota check failed:", error);
});
console.log("[SandboxManager SDK] SandboxManager SDK fully loaded and ready");
