import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Play, Square, Settings, Plus } from 'lucide-react';
import { useConfigStore } from '@/stores/configStore';
import { useProcessStore } from '@/stores/processStore';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewConfig: () => void;
  onSettings: () => void;
}

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette({
  open,
  onOpenChange,
  onNewConfig,
  onSettings,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { configs } = useConfigStore();
  const { processes, setActiveConfig, startProcess, stopProcess } = useProcessStore();

  const commands = useMemo<Command[]>(() => {
    const configCommands = configs.flatMap((config) => {
      const process = processes[config.id];
      const isRunning = process?.status === 'running';

      return [
        {
          id: `select-${config.id}`,
          label: config.name,
          description: isRunning ? 'Running' : 'Stopped',
          icon: isRunning ? (
            <div className="w-2 h-2 rounded-full bg-green-500" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-zinc-500" />
          ),
          action: () => {
            setActiveConfig(config.id);
            onOpenChange(false);
          },
          keywords: [config.type, 'select', 'open'],
        },
        {
          id: `toggle-${config.id}`,
          label: isRunning ? `Stop ${config.name}` : `Start ${config.name}`,
          icon: isRunning ? (
            <Square className="w-4 h-4 text-red-500" />
          ) : (
            <Play className="w-4 h-4 text-green-500" />
          ),
          action: () => {
            if (isRunning) {
              stopProcess(config.id);
            } else {
              startProcess(config);
            }
            onOpenChange(false);
          },
          keywords: isRunning ? ['stop', 'kill', 'terminate'] : ['start', 'run', 'launch'],
        },
      ];
    });

    const globalCommands: Command[] = [
      {
        id: 'new-config',
        label: 'New Configuration',
        icon: <Plus className="w-4 h-4 text-primary" />,
        action: () => {
          onNewConfig();
          onOpenChange(false);
        },
        keywords: ['create', 'add', 'new'],
      },
      {
        id: 'settings',
        label: 'Open Settings',
        icon: <Settings className="w-4 h-4 text-text-muted" />,
        action: () => {
          onSettings();
          onOpenChange(false);
        },
        keywords: ['preferences', 'options', 'configure'],
      },
    ];

    return [...globalCommands, ...configCommands];
  }, [configs, processes, setActiveConfig, startProcess, stopProcess, onOpenChange, onNewConfig, onSettings]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter((cmd) => {
      const matchesLabel = cmd.label.toLowerCase().includes(lowerQuery);
      const matchesDescription = cmd.description?.toLowerCase().includes(lowerQuery);
      const matchesKeywords = cmd.keywords?.some((k) => k.includes(lowerQuery));
      return matchesLabel || matchesDescription || matchesKeywords;
    });
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        filteredCommands[selectedIndex]?.action();
        break;
      case 'Escape':
        onOpenChange(false);
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 bg-surface border-border overflow-hidden">
        <div className="flex items-center border-b border-border px-3">
          <Search className="w-4 h-4 text-text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands and configurations..."
            className="border-0 focus-visible:ring-0 bg-transparent"
            autoFocus
          />
        </div>

        <ScrollArea className="max-h-80">
          <div className="p-2">
            {filteredCommands.length === 0 ? (
              <div className="text-center py-8 text-text-muted text-sm">
                No matching commands
              </div>
            ) : (
              filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-md text-left
                    transition-colors
                    ${index === selectedIndex ? 'bg-surface-hover' : 'hover:bg-surface-hover/50'}
                  `}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {cmd.icon}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text truncate">{cmd.label}</p>
                    {cmd.description && (
                      <p className="text-xs text-text-muted truncate">{cmd.description}</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-border px-3 py-2 flex items-center gap-4 text-xs text-text-muted">
          <span><kbd className="px-1 bg-background rounded">↑↓</kbd> Navigate</span>
          <span><kbd className="px-1 bg-background rounded">↵</kbd> Select</span>
          <span><kbd className="px-1 bg-background rounded">Esc</kbd> Close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
