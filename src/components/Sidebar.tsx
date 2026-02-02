import { useState } from 'react';
import { Plus, Settings, Play, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SidebarItem } from './SidebarItem';
import { SidebarFolder } from './SidebarFolder';
import { useConfigStore } from '@/stores/configStore';
import { useProcessStore } from '@/stores/processStore';

interface SidebarProps {
  onNewConfig: () => void;
  onEditConfig: (id: string) => void;
  onSettings: () => void;
}

export function Sidebar({ onNewConfig, onEditConfig, onSettings }: SidebarProps) {
  const [filter, setFilter] = useState('');
  const { configs, folders } = useConfigStore();
  const { processes, activeConfigId, setActiveConfig, startProcess, stopProcess } =
    useProcessStore();

  const filteredConfigs = configs.filter((c) =>
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  const ungroupedConfigs = filteredConfigs.filter((c) => !c.folderId);
  const groupedByFolder = folders.map((folder) => ({
    folder,
    configs: filteredConfigs.filter((c) => c.folderId === folder.id),
  }));

  const handleStartAll = async () => {
    for (const config of configs) {
      const process = processes[config.id];
      if (process?.status !== 'running') {
        await startProcess(config);
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Header */}
      <div className="p-3 space-y-3 relative z-10 bg-surface">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <Input
            placeholder="Filter configurations..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="!pl-9 h-8 bg-background border-border text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8"
            onClick={handleStartAll}
          >
            <Play className="w-3 h-3 mr-1" />
            Start All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={onNewConfig}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={onSettings}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Config List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {groupedByFolder.map(({ folder, configs: folderConfigs }) => (
            <SidebarFolder
              key={folder.id}
              folder={folder}
              configs={folderConfigs}
              processes={processes}
              activeConfigId={activeConfigId}
              onSelect={setActiveConfig}
              onStart={startProcess}
              onStop={stopProcess}
              onEdit={onEditConfig}
            />
          ))}

          {ungroupedConfigs.map((config) => (
            <SidebarItem
              key={config.id}
              config={config}
              process={processes[config.id]}
              isActive={activeConfigId === config.id}
              onSelect={() => setActiveConfig(config.id)}
              onStart={() => startProcess(config)}
              onStop={() => stopProcess(config.id)}
              onEdit={() => onEditConfig(config.id)}
            />
          ))}

          {configs.length === 0 && (
            <div className="text-center py-8 text-text-muted text-sm">
              No configurations yet.
              <br />
              <button
                className="text-primary hover:underline mt-2"
                onClick={onNewConfig}
              >
                Create your first config
              </button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
