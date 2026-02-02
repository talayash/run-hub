import { Terminal, Plus, FolderOpen, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onNewConfig: () => void;
}

export function EmptyState({ onNewConfig }: EmptyStateProps) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-md px-8">
        {/* Logo */}
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Terminal className="w-10 h-10 text-primary" />
        </div>

        <h2 className="text-2xl font-semibold text-text mb-2">Welcome to RunDeck</h2>
        <p className="text-text-muted mb-8">
          Manage all your terminal-based run configurations in one place.
          Create configurations for shells, Gradle, Maven, Node.js, Docker, and more.
        </p>

        {/* Quick actions */}
        <div className="space-y-3 mb-8">
          <Button
            className="w-full justify-start gap-3"
            onClick={onNewConfig}
          >
            <Plus className="w-4 h-4" />
            Create your first configuration
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            disabled
          >
            <FolderOpen className="w-4 h-4" />
            Import from IntelliJ (coming soon)
          </Button>
        </div>

        {/* Keyboard hints */}
        <div className="bg-surface rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-text-muted mb-3">
            <Keyboard className="w-4 h-4" />
            <span>Keyboard shortcuts</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted">New config</span>
              <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">Ctrl+N</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Command palette</span>
              <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">Ctrl+P</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Settings</span>
              <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">Ctrl+Shift+S</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Start all</span>
              <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">Ctrl+Shift+A</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
