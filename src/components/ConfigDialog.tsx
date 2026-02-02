import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConfigStore } from '@/stores/configStore';
import type { RunConfig, ConfigType } from '@/types';

interface ConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editConfigId?: string | null;
}

const CONFIG_TYPES: { value: ConfigType; label: string }[] = [
  { value: 'shell', label: 'Shell' },
  { value: 'gradle', label: 'Gradle' },
  { value: 'maven', label: 'Maven' },
  { value: 'node', label: 'Node.js' },
  { value: 'docker', label: 'Docker' },
  { value: 'spring-boot', label: 'Spring Boot' },
];

const DEFAULT_CONFIG: Omit<RunConfig, 'id'> = {
  name: '',
  type: 'shell',
  command: '',
  workingDir: '',
  env: {},
  args: [],
  autoRestart: false,
  restartDelay: 1000,
  maxRetries: 3,
};

export function ConfigDialog({ open, onOpenChange, editConfigId }: ConfigDialogProps) {
  const { configs, addConfig, updateConfig } = useConfigStore();
  const [formData, setFormData] = useState<Omit<RunConfig, 'id'>>(DEFAULT_CONFIG);
  const [envInput, setEnvInput] = useState({ key: '', value: '' });

  const isEditing = !!editConfigId;
  const editConfig = configs.find((c) => c.id === editConfigId);

  useEffect(() => {
    if (editConfig) {
      setFormData({
        name: editConfig.name,
        type: editConfig.type,
        command: editConfig.command || '',
        workingDir: editConfig.workingDir || '',
        env: editConfig.env,
        args: editConfig.args,
        folderId: editConfig.folderId,
        color: editConfig.color,
        autoRestart: editConfig.autoRestart,
        restartDelay: editConfig.restartDelay,
        maxRetries: editConfig.maxRetries,
      });
    } else {
      setFormData(DEFAULT_CONFIG);
    }
  }, [editConfig, open]);

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (isEditing && editConfigId) {
      updateConfig(editConfigId, formData);
    } else {
      addConfig({
        id: crypto.randomUUID(),
        ...formData,
      });
    }
    onOpenChange(false);
  };

  const addEnvVar = () => {
    if (envInput.key.trim()) {
      setFormData({
        ...formData,
        env: { ...formData.env, [envInput.key]: envInput.value },
      });
      setEnvInput({ key: '', value: '' });
    }
  };

  const removeEnvVar = (key: string) => {
    const newEnv = { ...formData.env };
    delete newEnv[key];
    setFormData({ ...formData, env: newEnv });
  };

  const getCommandLabel = () => {
    switch (formData.type) {
      case 'gradle':
        return 'Task (e.g., build, test)';
      case 'maven':
        return 'Goal (e.g., compile, package)';
      case 'node':
        return 'Script (e.g., start, dev)';
      case 'docker':
        return 'Compose file';
      case 'spring-boot':
        return 'Additional arguments';
      default:
        return 'Command';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="text-text">
            {isEditing ? 'Edit Configuration' : 'New Configuration'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="environment" className="flex-1">Environment</TabsTrigger>
            <TabsTrigger value="advanced" className="flex-1">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm text-text-muted">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Configuration"
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-text-muted">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {CONFIG_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    variant={formData.type === type.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className="h-8"
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-text-muted">{getCommandLabel()}</label>
              <Input
                value={formData.command}
                onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                placeholder={formData.type === 'shell' ? 'powershell.exe' : ''}
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-text-muted">Working Directory</label>
              <Input
                value={formData.workingDir}
                onChange={(e) => setFormData({ ...formData, workingDir: e.target.value })}
                placeholder="C:\projects\my-app"
                className="bg-background border-border"
              />
            </div>
          </TabsContent>

          <TabsContent value="environment" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input
                value={envInput.key}
                onChange={(e) => setEnvInput({ ...envInput, key: e.target.value })}
                placeholder="KEY"
                className="bg-background border-border"
              />
              <Input
                value={envInput.value}
                onChange={(e) => setEnvInput({ ...envInput, value: e.target.value })}
                placeholder="value"
                className="bg-background border-border"
              />
              <Button onClick={addEnvVar} variant="outline" size="sm">
                Add
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(formData.env).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 bg-background rounded px-3 py-2"
                >
                  <span className="text-sm font-mono text-primary">{key}</span>
                  <span className="text-text-muted">=</span>
                  <span className="text-sm font-mono text-text flex-1 truncate">
                    {value}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-text-muted hover:text-error"
                    onClick={() => removeEnvVar(key)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              {Object.keys(formData.env).length === 0 && (
                <p className="text-sm text-text-muted text-center py-4">
                  No environment variables defined
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoRestart"
                checked={formData.autoRestart}
                onChange={(e) =>
                  setFormData({ ...formData, autoRestart: e.target.checked })
                }
                className="rounded border-border"
              />
              <label htmlFor="autoRestart" className="text-sm text-text">
                Auto-restart on crash
              </label>
            </div>

            {formData.autoRestart && (
              <>
                <div className="space-y-2">
                  <label className="text-sm text-text-muted">Restart Delay (ms)</label>
                  <Input
                    type="number"
                    value={formData.restartDelay}
                    onChange={(e) =>
                      setFormData({ ...formData, restartDelay: parseInt(e.target.value) || 1000 })
                    }
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-text-muted">Max Retries</label>
                  <Input
                    type="number"
                    value={formData.maxRetries}
                    onChange={(e) =>
                      setFormData({ ...formData, maxRetries: parseInt(e.target.value) || 3 })
                    }
                    className="bg-background border-border"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-sm text-text-muted">Color Tag</label>
              <div className="flex gap-2">
                {['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'].map(
                  (color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded ${
                        formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-surface' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  )
                )}
                <button
                  className={`w-6 h-6 rounded border border-border ${
                    !formData.color ? 'ring-2 ring-white ring-offset-2 ring-offset-surface' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, color: undefined })}
                >
                  <span className="text-xs text-text-muted">×</span>
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
            {isEditing ? 'Save Changes' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
