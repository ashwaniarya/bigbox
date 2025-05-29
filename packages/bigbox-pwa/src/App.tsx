import { useState, useEffect } from 'react'
import './App.css'
import * as sandboxManager from './services/sandbox-manager';
import { HomeShell } from './components/HomeShell'

function App() {
  const [runningSandbox, setRunningSandbox] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  // Set up event listeners for SandboxManager events
  useEffect(() => {
    console.log('[App] Setting up SandboxManager event listeners...');

    const handleLoaded = (event: CustomEvent<{ id: string; meta?: Record<string, unknown> }>) => {
      const logMessage = `✅ Sandbox ${event.detail.id} loaded successfully`;
      console.log('[App] SandboxManager event:', logMessage);
    };

    const handleError = (event: CustomEvent<{ id: string; error: Error; context?: string }>) => {
      const logMessage = `❌ Error in sandbox ${event.detail.id}: ${event.detail.error.message}`;
      console.error('[App] SandboxManager error:', logMessage);
    };

    const handleStorageQuota = (event: CustomEvent<{ used: number; quota: number; percentage: number }>) => {
      const logMessage = `⚠️ Storage quota warning: ${event.detail.percentage.toFixed(1)}% used`;
      console.warn('[App] SandboxManager storage:', logMessage);
    };

    const handleCreated = (event: CustomEvent<{ id: string; meta?: Record<string, unknown> }>) => {
      const logMessage = `📦 Sandbox ${event.detail.id} created/updated`;
      console.log('[App] SandboxManager event:', logMessage);
    };

    const handleDestroyed = (event: CustomEvent<{ id: string }>) => {
      const logMessage = `🗑️ Sandbox ${event.detail.id} destroyed`;
      console.log('[App] SandboxManager event:', logMessage);
      if (runningSandbox === event.detail.id) {
        setRunningSandbox(null);
      }
    };

    const handlePaused = (event: CustomEvent<{ id: string }>) => {
      const logMessage = `⏸️ Sandbox ${event.detail.id} paused`;
      console.log('[App] SandboxManager event:', logMessage);
    };

    const handleResumed = (event: CustomEvent<{ id: string }>) => {
      const logMessage = `▶️ Sandbox ${event.detail.id} resumed`;
      console.log('[App] SandboxManager event:', logMessage);
    };

    // Add event listeners
    sandboxManager.sandboxEvents.on('loaded', handleLoaded);
    sandboxManager.sandboxEvents.on('error', handleError);
    sandboxManager.sandboxEvents.on('storageQuota', handleStorageQuota);
    sandboxManager.sandboxEvents.on('created', handleCreated);
    sandboxManager.sandboxEvents.on('destroyed', handleDestroyed);
    sandboxManager.sandboxEvents.on('paused', handlePaused);
    sandboxManager.sandboxEvents.on('resumed', handleResumed);

    return () => {
      console.log('[App] Removing SandboxManager event listeners...');
      sandboxManager.sandboxEvents.off('loaded', handleLoaded);
      sandboxManager.sandboxEvents.off('error', handleError);
      sandboxManager.sandboxEvents.off('storageQuota', handleStorageQuota);
      sandboxManager.sandboxEvents.off('created', handleCreated);
      sandboxManager.sandboxEvents.off('destroyed', handleDestroyed);
      sandboxManager.sandboxEvents.off('paused', handlePaused);
      sandboxManager.sandboxEvents.off('resumed', handleResumed);
    };
  }, [runningSandbox]);

  const handleDebugLog = (message: string) => {
    setDebugLogs(prev => [...prev.slice(-49), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  return (
    <div className="App">
      <HomeShell onDebugLog={handleDebugLog} />
      
      {/* Debug Panel (Hidden by default, can be toggled) */}
      {showDebug && (
        <div className="debug-panel">
          <div className="debug-header">
            <h3>Debug Log</h3>
            <button onClick={() => setShowDebug(false)}>×</button>
          </div>
          <div className="debug-content">
            {debugLogs.length === 0 ? (
              <p>No debug logs yet...</p>
            ) : (
              debugLogs.map((log, index) => (
                <div key={index} className="debug-log">{log}</div>
              ))
            )}
          </div>
          <button onClick={() => setDebugLogs([])}>Clear Logs</button>
        </div>
      )}
      
      {/* Hidden Debug Toggle (Accessible via key combination) */}
      <button 
        className="debug-toggle"
        onClick={() => setShowDebug(!showDebug)}
        style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          background: 'rgba(0,0,0,0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          fontSize: '10px',
          cursor: 'pointer',
          zIndex: 2000,
          opacity: 0.3
        }}
      >
        🐛
      </button>
    </div>
  )
}

export default App
