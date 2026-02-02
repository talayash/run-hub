import { useEffect } from 'react';
import { useConfigStore } from '@/stores/configStore';
import { useProcessStore } from '@/stores/processStore';

interface KeyboardShortcutsOptions {
  onNewConfig: () => void;
  onSettings: () => void;
  onCommandPalette: () => void;
  onSearch?: () => void;
}

export function useKeyboardShortcuts({
  onNewConfig,
  onSettings,
  onCommandPalette,
  onSearch,
}: KeyboardShortcutsOptions) {
  const { configs } = useConfigStore();
  const { processes, startProcess, stopProcess, clearOutput, activeConfigId } = useProcessStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape to still work
        if (e.key !== 'Escape') {
          return;
        }
      }

      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      // Ctrl+N - New config
      if (isCtrl && !isShift && e.key === 'n') {
        e.preventDefault();
        onNewConfig();
        return;
      }

      // Ctrl+Shift+S - Settings
      if (isCtrl && isShift && e.key === 'S') {
        e.preventDefault();
        onSettings();
        return;
      }

      // Ctrl+P - Command palette
      if (isCtrl && !isShift && e.key === 'p') {
        e.preventDefault();
        onCommandPalette();
        return;
      }

      // Ctrl+F - Search in terminal
      if (isCtrl && !isShift && e.key === 'f' && onSearch) {
        e.preventDefault();
        onSearch();
        return;
      }

      // Ctrl+L - Clear terminal
      if (isCtrl && !isShift && e.key === 'l' && activeConfigId) {
        e.preventDefault();
        clearOutput(activeConfigId);
        return;
      }

      // Ctrl+Shift+A - Start all
      if (isCtrl && isShift && e.key === 'A') {
        e.preventDefault();
        configs.forEach((config) => {
          const process = processes[config.id];
          if (process?.status !== 'running') {
            startProcess(config);
          }
        });
        return;
      }

      // Ctrl+Shift+X - Stop all
      if (isCtrl && isShift && e.key === 'X') {
        e.preventDefault();
        configs.forEach((config) => {
          const process = processes[config.id];
          if (process?.status === 'running') {
            stopProcess(config.id);
          }
        });
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    configs,
    processes,
    activeConfigId,
    startProcess,
    stopProcess,
    clearOutput,
    onNewConfig,
    onSettings,
    onCommandPalette,
    onSearch,
  ]);
}
