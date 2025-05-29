import { useState, useEffect, useRef } from 'react';
import * as sandboxManager from '@bigbox/sandbox-manager';
import './HomeShell.css';

// Import UI components
import SearchContainer from './ui/SearchContainer';
import DockContainer from './ui/DockContainer';
import HomeScreenContainer from './ui/HomeScreenContainer';
import AppWindowContainer from './ui/AppWindowContainer';

// Import modals
import { SandboxListModal } from './SandboxListModal';
import { ChatModal } from './ChatModal';
import { SettingsModal } from './SettingsModal';

interface HomeShellProps {
  onDebugLog?: (message: string) => void;
}

export function HomeShell({ onDebugLog }: HomeShellProps) {
  const [sandboxes, setSandboxes] = useState<sandboxManager.Sandbox[]>([]);
  const [runningSandbox, setRunningSandbox] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'list' | 'chat' | 'settings' | null>(null);
  const [wallpaper, setWallpaper] = useState('gradient-blue');
  const sandboxDisplayRef = useRef<HTMLDivElement>(null);

  const log = (message: string) => {
    console.log(`[HomeShell] ${message}`);
    onDebugLog?.(message);
  };

  // Load sandboxes on mount
  useEffect(() => {
    loadSandboxes();
    
    // Set up event listeners for real-time updates
    const handleCreated = () => loadSandboxes();
    const handleDestroyed = () => loadSandboxes();
    
    sandboxManager.sandboxEvents.on('created', handleCreated);
    sandboxManager.sandboxEvents.on('destroyed', handleDestroyed);
    
    return () => {
      sandboxManager.sandboxEvents.off('created', handleCreated);
      sandboxManager.sandboxEvents.off('destroyed', handleDestroyed);
    };
  }, []);

  const loadSandboxes = async () => {
    try {
      const list = await sandboxManager.list();
      setSandboxes(list);
      log(`Loaded ${list.length} sandboxes for home screen`);
    } catch (error) {
      log(`Error loading sandboxes: ${(error as Error).message}`);
    }
  };

  const handleSandboxClick = async (sandbox: sandboxManager.Sandbox) => {
    try {
      // Stop any currently running sandbox
      if (runningSandbox) {
        sandboxManager.stop(runningSandbox);
      }

      log(`Launching sandbox: ${sandbox.meta?.title || sandbox.id}`);
      
      // Set the running sandbox first to trigger re-render and make ref available
      setRunningSandbox(sandbox.id);
      
    } catch (error) {
      log(`Error launching sandbox: ${(error as Error).message}`);
      setRunningSandbox(null);
    }
  };

  // Effect to run sandbox when runningSandbox changes and ref becomes available
  useEffect(() => {
    if (runningSandbox && sandboxDisplayRef.current) {
      const runSandbox = async () => {
        try {
          // Clear display area
          sandboxDisplayRef.current!.innerHTML = '';
          
          // Run the sandbox
          await sandboxManager.run(runningSandbox, sandboxDisplayRef.current!);
          
        } catch (error) {
          log(`Error running sandbox: ${(error as Error).message}`);
          setRunningSandbox(null);
        }
      };
      
      runSandbox();
    }
  }, [runningSandbox]); // Run when runningSandbox changes

  const handleBackToHome = () => {
    if (runningSandbox) {
      sandboxManager.stop(runningSandbox);
      setRunningSandbox(null);
      log('Returned to home screen');
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleNewSandboxFromChat = async (html: string, meta: Record<string, unknown>) => {
    try {
      log('Creating new sandbox from chat...');
      await sandboxManager.create(html, meta);
      await loadSandboxes(); // Refresh the home screen
      setActiveModal(null); // Close chat modal
    } catch (error) {
      log(`Error creating sandbox from chat: ${(error as Error).message}`);
    }
  };

  return (
    <div className={`home-shell ${wallpaper}`}>
      {/* Main Display Area */}
      <div className="display-area">
        {runningSandbox ? (
          /* Fullscreen Sandbox Mode */
          <AppWindowContainer
            ref={sandboxDisplayRef}
            title={sandboxes.find(s => s.id === runningSandbox)?.meta?.title as string || 'App'}
            onBackClick={handleBackToHome}
          />
        ) : (
          /* Home Screen Mode */
          <>
            <HomeScreenContainer 
              sandboxes={sandboxes}
              onSandboxClick={handleSandboxClick}
              onAddAppClick={() => setActiveModal('chat')}
            />
            
            {/* Search Bar - Only visible on home screen */}
            <SearchContainer onClick={() => setActiveModal('list')} />

            {/* iOS-style Bottom Dock - Only visible on home screen */}
            <DockContainer 
              activeModal={activeModal} 
              onIconClick={setActiveModal} 
            />
          </>
        )}
      </div>

      {/* Modals */}
      {activeModal === 'list' && (
        <SandboxListModal
          sandboxes={sandboxes}
          runningSandbox={runningSandbox}
          onClose={closeModal}
          onSandboxAction={handleSandboxClick}
          onRefresh={loadSandboxes}
        />
      )}
      
      {activeModal === 'chat' && (
        <ChatModal
          onClose={closeModal}
          onNewSandbox={handleNewSandboxFromChat}
        />
      )}
      
      {activeModal === 'settings' && (
        <SettingsModal
          onClose={closeModal}
          wallpaper={wallpaper}
          onWallpaperChange={setWallpaper}
        />
      )}
    </div>
  );
} 