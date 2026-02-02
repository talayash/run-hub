import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useSettingsStore } from '@/stores/settingsStore';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const settings = useSettingsStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="text-text">Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="terminal" className="flex-1">Terminal</TabsTrigger>
            <TabsTrigger value="appearance" className="flex-1">Appearance</TabsTrigger>
            <TabsTrigger value="shortcuts" className="flex-1">Shortcuts</TabsTrigger>
            <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text">Start on boot</p>
                  <p className="text-xs text-text-muted">Launch RunDeck when Windows starts</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.startOnBoot}
                  onChange={(e) => settings.updateSettings({ startOnBoot: e.target.checked })}
                  className="rounded"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text">Minimize to tray</p>
                  <p className="text-xs text-text-muted">Keep RunDeck running in system tray when closed</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.minimizeToTray}
                  onChange={(e) => settings.updateSettings({ minimizeToTray: e.target.checked })}
                  className="rounded"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-text">Default shell</p>
                <Input
                  value={settings.defaultShell}
                  onChange={(e) => settings.updateSettings({ defaultShell: e.target.value })}
                  placeholder="powershell.exe"
                  className="bg-background border-border"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="terminal" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-text">Font family</p>
                <Input
                  value={settings.fontFamily}
                  onChange={(e) => settings.updateSettings({ fontFamily: e.target.value })}
                  className="bg-background border-border font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-text">Font size</p>
                  <Input
                    type="number"
                    value={settings.fontSize}
                    onChange={(e) => settings.updateSettings({ fontSize: parseInt(e.target.value) || 13 })}
                    min={8}
                    max={24}
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-text">Scrollback lines</p>
                  <Input
                    type="number"
                    value={settings.scrollback}
                    onChange={(e) => settings.updateSettings({ scrollback: parseInt(e.target.value) || 10000 })}
                    min={1000}
                    max={100000}
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-text">Cursor style</p>
                <div className="flex gap-2">
                  {(['bar', 'block', 'underline'] as const).map((style) => (
                    <Button
                      key={style}
                      variant={settings.cursorStyle === style ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => settings.updateSettings({ cursorStyle: style })}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text">Cursor blink</p>
                <input
                  type="checkbox"
                  checked={settings.cursorBlink}
                  onChange={(e) => settings.updateSettings({ cursorBlink: e.target.checked })}
                  className="rounded"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-text">Accent color</p>
                <div className="flex gap-2">
                  {['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(
                    (color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded ${
                          settings.accentColor === color
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-surface'
                            : ''
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => settings.updateSettings({ accentColor: color })}
                      />
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-text">Sidebar width</p>
                <Input
                  type="number"
                  value={settings.sidebarWidth}
                  onChange={(e) => settings.updateSettings({ sidebarWidth: parseInt(e.target.value) || 280 })}
                  min={200}
                  max={400}
                  className="bg-background border-border"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shortcuts" className="mt-4">
            <div className="space-y-2">
              {[
                { key: 'Ctrl+N', action: 'New configuration' },
                { key: 'Ctrl+Shift+S', action: 'Open settings' },
                { key: 'Ctrl+F', action: 'Search in terminal' },
                { key: 'Ctrl+P', action: 'Command palette' },
                { key: 'Ctrl+L', action: 'Clear terminal' },
                { key: 'Ctrl+Shift+A', action: 'Start all' },
                { key: 'Ctrl+Shift+X', action: 'Stop all' },
              ].map(({ key, action }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2 px-3 bg-background rounded"
                >
                  <span className="text-sm text-text">{action}</span>
                  <kbd className="px-2 py-1 bg-surface border border-border rounded text-xs font-mono text-text-muted">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">R</span>
              </div>
              <h2 className="text-xl font-semibold text-text mb-1">RunDeck</h2>
              <p className="text-text-muted mb-4">Version 0.1.0</p>
              <p className="text-sm text-text-muted max-w-md mx-auto">
                A Windows desktop application for managing terminal-based run
                configurations. Built with Tauri, React, and TypeScript.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
