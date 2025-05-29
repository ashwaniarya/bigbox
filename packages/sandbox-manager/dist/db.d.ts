interface SandboxRecord {
    hash: string;
    html: string;
    meta?: Record<string, any>;
    createdAt: Date;
    lastAccessed?: Date;
}
export declare function addSandbox(hash: string, html: string, meta?: Record<string, any>): Promise<string>;
export declare function getSandbox(hash: string): Promise<SandboxRecord | undefined>;
export declare function listSandboxes(): Promise<SandboxRecord[]>;
export declare function deleteSandbox(hash: string): Promise<void>;
export declare function calculateHash(htmlContent: string): Promise<string>;
export {};
