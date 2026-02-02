import { Play, Square, RotateCw, Trash2, Copy, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useConfigStore } from '@/stores/configStore';
import { useProcessStore } from '@/stores/processStore';

interface TerminalToolbarProps {
  onSearch?: () => void;
}

export function TerminalToolbar({ onSearch }: TerminalToolbarProps) {
  const { configs } = useConfigStore();
  const { processes, activeConfigId, startProcess, stopProcess, restartProcess, clearOutput } =
    useProcessStore();

  const activeConfig = configs.find((c) => c.id === activeConfigId);
  const process = activeConfigId ? processes[activeConfigId] : undefined;
  const status = process?.status || 'stopped';
  const isRunning = status === 'running';

  const statusBadge = {
    stopped: { label: 'Stopped', className: 'bg-zinc-500/20 text-zinc-400' },
    starting: { label: 'Starting', className: 'bg-yellow-500/20 text-yellow-500' },
    running: { label: 'Running', className: 'bg-green-500/20 text-green-500' },
    error: { label: 'Error', className: 'bg-red-500/20 text-red-500' },
  };

  if (!activeConfig) {
    return (
      <div className="h-10 bg-surface border-b border-border flex items-center px-3">
        <span className="text-sm text-text-muted">No configuration selected</span>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-10 bg-surface border-b border-border flex items-center px-3 gap-2">
        {/* Config name and status */}
        <span className="text-sm font-medium text-text">{activeConfig.name}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${statusBadge[status].className}`}>
          {statusBadge[status].label}
        </span>

        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {isRunning ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => stopProcess(activeConfig.id)}
                >
                  <Square className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Stop</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => startProcess(activeConfig)}
                >
                  <Play className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Start</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => restartProcess(activeConfig)}
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Restart</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => clearOutput(activeConfig.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Copy className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy Output</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={onSearch}
              >
                <Search className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search (Ctrl+F)</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
