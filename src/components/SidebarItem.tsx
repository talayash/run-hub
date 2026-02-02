import { Play, Square, MoreVertical } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { RunConfig, ProcessState } from '@/types';
import { useConfigStore } from '@/stores/configStore';

interface SidebarItemProps {
  config: RunConfig;
  process?: ProcessState;
  isActive: boolean;
  onSelect: () => void;
  onStart: () => void;
  onStop: () => void;
  onEdit: () => void;
}

export function SidebarItem({
  config,
  process,
  isActive,
  onSelect,
  onStart,
  onStop,
  onEdit,
}: SidebarItemProps) {
  const { deleteConfig, duplicateConfig } = useConfigStore();

  const status = process?.status || 'stopped';
  const isRunning = status === 'running';
  const isStarting = status === 'starting';

  const statusColors = {
    stopped: 'bg-zinc-500',
    starting: 'bg-yellow-500 animate-pulse',
    running: 'bg-green-500',
    error: 'bg-red-500',
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRunning) {
      onStop();
    } else {
      onStart();
    }
  };

  const menuContent = (
    <>
      <ContextMenuItem onClick={isRunning ? onStop : onStart}>
        {isRunning ? 'Stop' : 'Start'}
      </ContextMenuItem>
      <ContextMenuItem onClick={onEdit}>Edit</ContextMenuItem>
      <ContextMenuItem onClick={() => duplicateConfig(config.id)}>
        Duplicate
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        className="text-red-500"
        onClick={() => deleteConfig(config.id)}
      >
        Delete
      </ContextMenuItem>
    </>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={`
            group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer
            transition-colors hover:bg-surface-hover
            ${isActive ? 'bg-surface-hover' : ''}
          `}
          onClick={onSelect}
        >
          {/* Status indicator */}
          <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />

          {/* Config name */}
          <span className="flex-1 text-sm text-text truncate">{config.name}</span>

          {/* Color tag */}
          {config.color && (
            <div
              className="w-2 h-4 rounded-sm"
              style={{ backgroundColor: config.color }}
            />
          )}

          {/* Action buttons (visible on hover) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleAction}
              disabled={isStarting}
            >
              {isRunning ? (
                <Square className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={isRunning ? onStop : onStart}>
                  {isRunning ? 'Stop' : 'Start'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => duplicateConfig(config.id)}>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500"
                  onClick={() => deleteConfig(config.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>{menuContent}</ContextMenuContent>
    </ContextMenu>
  );
}
