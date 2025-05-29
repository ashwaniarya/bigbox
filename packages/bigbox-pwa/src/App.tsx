import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import * as sandboxManager from '@bigbox/sandbox-manager';
import { HomeShell } from './components/HomeShell'

function App() {
  const [count, setCount] = useState(0)
  const [sandboxes, setSandboxes] = useState<sandboxManager.Sandbox[]>([]);
  const [message, setMessage] = useState('');
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [runningSandbox, setRunningSandbox] = useState<string | null>(null);
  const sandboxContainerRef = useRef<HTMLDivElement>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  // Set up event listeners for SandboxManager events
  useEffect(() => {
    console.log('[App] Setting up SandboxManager event listeners...');

    const handleLoaded = (event: CustomEvent<{ id: string; meta?: Record<string, unknown> }>) => {
      const logMessage = `✅ Sandbox ${event.detail.id} loaded successfully`;
      console.log('[App] SandboxManager event:', logMessage);
      setEventLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${logMessage}`]);
      setMessage(`Sandbox ${event.detail.id} is now running!`);
    };

    const handleError = (event: CustomEvent<{ id: string; error: Error; context?: string }>) => {
      const logMessage = `❌ Error in sandbox ${event.detail.id}: ${event.detail.error.message}`;
      console.error('[App] SandboxManager error:', logMessage);
      setEventLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${logMessage}`]);
      setMessage(`Error: ${event.detail.error.message}`);
    };

    const handleStorageQuota = (event: CustomEvent<{ used: number; quota: number; percentage: number }>) => {
      const logMessage = `⚠️ Storage quota warning: ${event.detail.percentage.toFixed(1)}% used`;
      console.warn('[App] SandboxManager storage:', logMessage);
      setEventLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${logMessage}`]);
    };

    const handleCreated = (event: CustomEvent<{ id: string; meta?: Record<string, unknown> }>) => {
      const logMessage = `📦 Sandbox ${event.detail.id} created/updated`;
      console.log('[App] SandboxManager event:', logMessage);
      setEventLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${logMessage}`]);
    };

    const handleDestroyed = (event: CustomEvent<{ id: string }>) => {
      const logMessage = `🗑️ Sandbox ${event.detail.id} destroyed`;
      console.log('[App] SandboxManager event:', logMessage);
      setEventLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${logMessage}`]);
      if (runningSandbox === event.detail.id) {
        setRunningSandbox(null);
      }
    };

    const handlePaused = (event: CustomEvent<{ id: string }>) => {
      const logMessage = `⏸️ Sandbox ${event.detail.id} paused`;
      console.log('[App] SandboxManager event:', logMessage);
      setEventLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${logMessage}`]);
    };

    const handleResumed = (event: CustomEvent<{ id: string }>) => {
      const logMessage = `▶️ Sandbox ${event.detail.id} resumed`;
      console.log('[App] SandboxManager event:', logMessage);
      setEventLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${logMessage}`]);
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

  const handleCreateTestSandbox = async () => {
    try {
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Test Sandbox</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      padding: 20px; 
      background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
    }
    .container { 
      max-width: 400px; 
      margin: 0 auto; 
      background: rgba(255,255,255,0.1);
      padding: 30px;
      border-radius: 15px;
      backdrop-filter: blur(10px);
    }
    button { 
      background: #ff6b6b; 
      color: white; 
      border: none; 
      padding: 10px 20px; 
      border-radius: 5px; 
      cursor: pointer;
      font-size: 16px;
    }
    button:hover { background: #ff5252; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Test Sandbox App</h1>
    <p>Created at: ${new Date().toLocaleString()}</p>
    <p>This is a test sandbox running in a secure iframe!</p>
    <button onclick="alert('Hello from sandbox!')">Click me!</button>
    <p id="counter">Clicks: 0</p>
    <script>
      console.log('🏃 Test sandbox script running!');
      let clicks = 0;
      document.querySelector('button').addEventListener('click', () => {
        clicks++;
        document.getElementById('counter').textContent = 'Clicks: ' + clicks;
        console.log('Button clicked ' + clicks + ' times');
      });
    </script>
  </div>
</body>
</html>`;
      
      const meta = { 
        title: 'Test Sandbox App', 
        createdBy: 'App.tsx',
        version: '1.0',
        description: 'A test sandbox with interactive elements'
      };
      
      setMessage(`Hashing content...`);
      const hash = await sandboxManager.getHash(htmlContent);
      setMessage(`Content hash: ${hash}. Creating sandbox...`);
      await sandboxManager.create(htmlContent, meta);
      setMessage(`Test sandbox ${hash} created/updated successfully.`);
      await handleListSandboxes(); // Refresh list
    } catch (error) {
      console.error("[App] Error creating test sandbox:", error);
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  const handleListSandboxes = async () => {
    try {
      setMessage('Listing sandboxes...');
      const list = await sandboxManager.list();
      setSandboxes(list);
      setMessage(`Found ${list.length} sandboxes.`);
      console.log("[App] Fetched sandboxes:", list);
    } catch (error) {
      console.error("[App] Error listing sandboxes:", error);
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  const handleDeleteSandbox = async (id: string) => {
    try {
      setMessage(`Deleting sandbox ${id}...`);
      
      // Stop sandbox if it's currently running
      if (runningSandbox === id) {
        sandboxManager.stop(id);
        setRunningSandbox(null);
      }
      
      await sandboxManager.destroy(id);
      setMessage(`Sandbox ${id} deleted.`);
      await handleListSandboxes(); // Refresh list
    } catch (error) {
      console.error(`[App] Error deleting sandbox ${id}:`, error);
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  const handleRunSandbox = async (id: string) => {
    try {
      if (!sandboxContainerRef.current) {
        throw new Error('Sandbox container not available');
      }

      // Stop any currently running sandbox
      if (runningSandbox) {
        sandboxManager.stop(runningSandbox);
      }

      // Clear container
      sandboxContainerRef.current.innerHTML = '';
      
      setMessage(`Starting sandbox ${id}...`);
      setRunningSandbox(id);
      
      await sandboxManager.run(id, sandboxContainerRef.current);
      
    } catch (error) {
      console.error(`[App] Error running sandbox ${id}:`, error);
      setMessage(`Error: ${(error as Error).message}`);
      setRunningSandbox(null);
    }
  };

  const handleStopSandbox = () => {
    if (runningSandbox) {
      sandboxManager.stop(runningSandbox);
      setRunningSandbox(null);
      setMessage('Sandbox stopped.');
    }
  };

  const handlePauseSandbox = () => {
    if (runningSandbox) {
      sandboxManager.pause(runningSandbox);
      setMessage('Sandbox paused.');
    }
  };

  const handleResumeSandbox = () => {
    if (runningSandbox) {
      sandboxManager.resume(runningSandbox);
      setMessage('Sandbox resumed.');
    }
  };

  const clearEventLog = () => {
    setEventLog([]);
  };

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
