import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  Settings,
  Terminal,
  Palette,
  Keyboard,
  Info,
  Monitor,
  Type,
  MousePointer2,
  Rows3,
  ChevronRight,
} from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACCENT_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const NAV_ITEMS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'terminal', label: 'Terminal', icon: Terminal },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  { id: 'about', label: 'About', icon: Info },
];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const settings = useSettingsStore();
  const [activeTab, setActiveTab] = useState('general');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[520px] p-0 bg-card border-border/50 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar Navigation */}
          <div className="w-48 bg-background/50 border-r border-border/50 flex flex-col">
            <DialogHeader className="p-4 pb-2">
              <DialogTitle className="text-text text-base">Settings</DialogTitle>
            </DialogHeader>
            <nav className="flex-1 p-2 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                      transition-all duration-150
                      ${isActive
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-text-muted hover:text-text hover:bg-surface-hover border border-transparent'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && <ChevronRight className="w-3 h-3" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-6 py-4 border-b border-border/50">
              <h2 className="text-lg font-semibold text-text">
                {NAV_ITEMS.find(item => item.id === activeTab)?.label}
              </h2>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                {/* General Tab */}
                {activeTab === 'general' && (
                  <div className="space-y-6 animate-slide-up-fade">
                    <SettingSection title="Startup" icon={Monitor}>
                      <SettingToggle
                        label="Start on boot"
                        description="Launch RunHub when Windows starts"
                        checked={settings.startOnBoot}
                        onChange={(checked) => settings.updateSettings({ startOnBoot: checked })}
                      />
                      <SettingToggle
                        label="Minimize to tray"
                        description="Keep RunHub running in system tray when closed"
                        checked={settings.minimizeToTray}
                        onChange={(checked) => settings.updateSettings({ minimizeToTray: checked })}
                      />
                    </SettingSection>

                    <SettingSection title="Shell" icon={Terminal}>
                      <div className="space-y-2">
                        <label className="text-sm text-text-muted">Default shell</label>
                        <Input
                          value={settings.defaultShell}
                          onChange={(e) => settings.updateSettings({ defaultShell: e.target.value })}
                          placeholder="powershell.exe"
                          className="bg-background/50 border-border/50 font-mono"
                        />
                      </div>
                    </SettingSection>
                  </div>
                )}

                {/* Terminal Tab */}
                {activeTab === 'terminal' && (
                  <div className="space-y-6 animate-slide-up-fade">
                    <SettingSection title="Font" icon={Type}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm text-text-muted">Font family</label>
                          <Input
                            value={settings.fontFamily}
                            onChange={(e) => settings.updateSettings({ fontFamily: e.target.value })}
                            className="bg-background/50 border-border/50 font-mono text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm text-text-muted">Font size</label>
                            <Input
                              type="number"
                              value={settings.fontSize}
                              onChange={(e) => settings.updateSettings({ fontSize: parseInt(e.target.value) || 13 })}
                              min={8}
                              max={24}
                              className="bg-background/50 border-border/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-text-muted">Scrollback lines</label>
                            <Input
                              type="number"
                              value={settings.scrollback}
                              onChange={(e) => settings.updateSettings({ scrollback: parseInt(e.target.value) || 10000 })}
                              min={1000}
                              max={100000}
                              className="bg-background/50 border-border/50"
                            />
                          </div>
                        </div>
                      </div>
                    </SettingSection>

                    <SettingSection title="Cursor" icon={MousePointer2}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm text-text-muted">Cursor style</label>
                          <div className="flex gap-2">
                            {(['bar', 'block', 'underline'] as const).map((style) => (
                              <Button
                                key={style}
                                variant={settings.cursorStyle === style ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => settings.updateSettings({ cursorStyle: style })}
                                className={`flex-1 ${settings.cursorStyle === style ? 'shadow-lg shadow-primary/20' : ''}`}
                              >
                                {style.charAt(0).toUpperCase() + style.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <SettingToggle
                          label="Cursor blink"
                          description="Animate cursor blinking in terminal"
                          checked={settings.cursorBlink}
                          onChange={(checked) => settings.updateSettings({ cursorBlink: checked })}
                        />
                      </div>
                    </SettingSection>
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6 animate-slide-up-fade">
                    <SettingSection title="Theme" icon={Palette}>
                      <div className="space-y-3">
                        <label className="text-sm text-text-muted">Accent color</label>
                        <div className="flex gap-3">
                          {ACCENT_COLORS.map((color) => (
                            <button
                              key={color}
                              className={`
                                w-10 h-10 rounded-xl transition-all duration-150
                                hover:scale-110 active:scale-95
                                ${settings.accentColor === color
                                  ? 'ring-2 ring-white ring-offset-2 ring-offset-card scale-110 shadow-lg'
                                  : 'hover:shadow-md'
                                }
                              `}
                              style={{
                                backgroundColor: color,
                                boxShadow: settings.accentColor === color ? `0 4px 14px ${color}40` : undefined
                              }}
                              onClick={() => settings.updateSettings({ accentColor: color })}
                            />
                          ))}
                        </div>
                      </div>
                    </SettingSection>

                    <SettingSection title="Layout" icon={Rows3}>
                      <div className="space-y-2">
                        <label className="text-sm text-text-muted">Sidebar width</label>
                        <div className="flex items-center gap-4">
                          <Input
                            type="range"
                            value={settings.sidebarWidth}
                            onChange={(e) => settings.updateSettings({ sidebarWidth: parseInt(e.target.value) || 280 })}
                            min={200}
                            max={400}
                            className="flex-1 h-2 bg-background/50 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                          <span className="text-sm text-text-muted w-12 text-right font-mono">
                            {settings.sidebarWidth}px
                          </span>
                        </div>
                      </div>
                    </SettingSection>
                  </div>
                )}

                {/* Shortcuts Tab */}
                {activeTab === 'shortcuts' && (
                  <div className="space-y-4 animate-slide-up-fade">
                    <div className="grid gap-2">
                      {[
                        { key: 'Ctrl+N', action: 'New configuration', category: 'Config' },
                        { key: 'Ctrl+P', action: 'Command palette', category: 'Navigation' },
                        { key: 'Ctrl+Shift+S', action: 'Open settings', category: 'Navigation' },
                        { key: 'Ctrl+F', action: 'Search in terminal', category: 'Terminal' },
                        { key: 'Ctrl+L', action: 'Clear terminal', category: 'Terminal' },
                        { key: 'Ctrl+Shift+A', action: 'Start all', category: 'Process' },
                        { key: 'Ctrl+Shift+X', action: 'Stop all', category: 'Process' },
                      ].map(({ key, action }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between py-3 px-4 bg-background/30 rounded-lg border border-border/30 hover:bg-background/50 transition-colors"
                        >
                          <span className="text-sm text-text">{action}</span>
                          <kbd className="px-3 py-1.5 bg-card border border-border/50 rounded-lg text-xs font-mono text-text-muted shadow-sm">
                            {key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-text-muted text-center pt-2">
                      Custom keyboard shortcuts coming soon
                    </p>
                  </div>
                )}

                {/* About Tab */}
                {activeTab === 'about' && (
                  <div className="flex flex-col items-center justify-center py-8 animate-slide-up-fade">
                    <div className="relative w-24 h-24 mb-6">
                      <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse"></div>
                      <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30">
                        <span className="text-white text-4xl font-bold">R</span>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-text mb-1">RunHub</h2>
                    <p className="text-text-muted mb-6">Version 0.1.0</p>

                    <div className="bg-background/30 rounded-xl p-4 border border-border/30 max-w-sm text-center">
                      <p className="text-sm text-text-muted leading-relaxed">
                        A Windows desktop application for managing terminal-based run
                        configurations. Built with Tauri, React, and TypeScript.
                      </p>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Info className="w-4 h-4" />
                        Check for updates
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Reusable Setting Section Component
function SettingSection({
  title,
  icon: Icon,
  children
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-text">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="pl-6 space-y-3">
        {children}
      </div>
    </div>
  );
}

// Reusable Toggle Setting Component
function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/30 cursor-pointer hover:bg-background/50 transition-colors group">
      <div>
        <p className="text-sm font-medium text-text group-hover:text-primary transition-colors">{label}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-border rounded-full peer-checked:bg-primary transition-colors"></div>
        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
      </div>
    </label>
  );
}
