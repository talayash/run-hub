import { useProcessStore } from '@/stores/processStore';
import { useConfigStore } from '@/stores/configStore';

export function StatusBar() {
  const { processes, activeConfigId } = useProcessStore();
  const { configs } = useConfigStore();

  const runningCount = Object.values(processes).filter(
    (p) => p.status === 'running'
  ).length;

  const activeConfig = configs.find((c) => c.id === activeConfigId);

  return (
    <div className="h-6 bg-surface border-t border-border flex items-center justify-between px-3 text-xs text-text-muted">
      <div className="flex items-center gap-4">
        <span>
          {runningCount} process{runningCount !== 1 ? 'es' : ''} running
        </span>
        {activeConfig && (
          <span className="text-text">
            Active: {activeConfig.name}
          </span>
        )}
      </div>
      <span>v0.1.0</span>
    </div>
  );
}
