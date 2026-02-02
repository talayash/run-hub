import { TerminalView } from './TerminalView';
import { useProcessStore } from '@/stores/processStore';
import type { SearchAddon } from '@xterm/addon-search';

interface TerminalManagerProps {
  onSearchAddonReady?: (searchAddon: SearchAddon | null) => void;
}

export function TerminalManager({ onSearchAddonReady }: TerminalManagerProps) {
  const { processes, activeConfigId } = useProcessStore();

  // Get all config IDs that have been started at some point
  const startedConfigIds = Object.keys(processes);

  if (startedConfigIds.length === 0 || !activeConfigId) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted">
        <div className="text-center">
          <p className="text-lg mb-2">No active terminal</p>
          <p className="text-sm">Select a configuration to start</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {startedConfigIds.map((configId) => (
        <div
          key={configId}
          className={`absolute inset-0 ${
            configId === activeConfigId ? '' : 'invisible'
          }`}
        >
          <TerminalView
            configId={configId}
            isActive={configId === activeConfigId}
            onSearchAddonReady={configId === activeConfigId ? onSearchAddonReady : undefined}
          />
        </div>
      ))}
    </div>
  );
}
