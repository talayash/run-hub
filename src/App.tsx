import { useEffect, useState, useRef, useCallback } from 'react';
import { TitleBar } from '@/components/TitleBar';
import { Sidebar } from '@/components/Sidebar';
import { TerminalManager } from '@/components/TerminalManager';
import { TerminalToolbar } from '@/components/TerminalToolbar';
import { TerminalSearch } from '@/components/TerminalSearch';
import { StatusBar } from '@/components/StatusBar';
import { ConfigDialog } from '@/components/ConfigDialog';
import { SettingsDialog } from '@/components/SettingsDialog';
import { CommandPalette } from '@/components/CommandPalette';
import { EmptyState } from '@/components/EmptyState';
import { useConfigStore } from '@/stores/configStore';
import { useProcessStore } from '@/stores/processStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { SearchAddon } from '@xterm/addon-search';

function App() {
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [editConfigId, setEditConfigId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchAddon, setSearchAddon] = useState<SearchAddon | null>(null);

  const { configs, loadConfig } = useConfigStore();
  const { activeConfigId, initListeners } = useProcessStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConfig();
    const cleanupPromise = initListeners();
    return () => {
      cleanupPromise.then((cleanup) => cleanup());
    };
  }, [loadConfig, initListeners]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = Math.min(Math.max(e.clientX, 200), 400);
    setSidebarWidth(newWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleNewConfig = useCallback(() => {
    setEditConfigId(null);
    setConfigDialogOpen(true);
  }, []);

  const handleEditConfig = useCallback((id: string) => {
    setEditConfigId(id);
    setConfigDialogOpen(true);
  }, []);

  const handleSettings = useCallback(() => {
    setSettingsDialogOpen(true);
  }, []);

  const handleCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true);
  }, []);

  const handleSearch = useCallback(() => {
    setSearchOpen(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setSearchOpen(false);
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewConfig: handleNewConfig,
    onSettings: handleSettings,
    onCommandPalette: handleCommandPalette,
    onSearch: handleSearch,
  });

  const showEmptyState = configs.length === 0;
  const showTerminal = !showEmptyState && activeConfigId;

  return (
    <div className="h-screen flex flex-col bg-background" ref={containerRef}>
      <TitleBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div style={{ width: sidebarWidth }} className="flex-shrink-0">
          <Sidebar
            onNewConfig={handleNewConfig}
            onEditConfig={handleEditConfig}
            onSettings={handleSettings}
          />
        </div>

        {/* Resizer */}
        <div
          className="w-1 bg-border hover:bg-primary cursor-col-resize transition-colors"
          onMouseDown={() => setIsResizing(true)}
        />

        {/* Main panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {showEmptyState ? (
            <EmptyState onNewConfig={handleNewConfig} />
          ) : (
            <>
              <TerminalToolbar onSearch={handleSearch} />
              <div className="flex-1 overflow-hidden bg-background relative">
                {showTerminal && searchOpen && (
                  <TerminalSearch
                    searchAddon={searchAddon}
                    onClose={handleCloseSearch}
                  />
                )}
                {showTerminal ? (
                  <TerminalManager onSearchAddonReady={setSearchAddon} />
                ) : (
                  <div className="h-full flex items-center justify-center text-text-muted">
                    <div className="text-center">
                      <p className="text-lg mb-2">Select a configuration</p>
                      <p className="text-sm">Click on a config in the sidebar to view its terminal</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <StatusBar />

      {/* Dialogs */}
      <ConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        editConfigId={editConfigId}
      />

      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onNewConfig={handleNewConfig}
        onSettings={handleSettings}
      />
    </div>
  );
}

export default App;
