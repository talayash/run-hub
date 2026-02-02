import { Minus, Square, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export function TitleBar() {
  const appWindow = getCurrentWindow();

  const handleMinimize = () => appWindow.minimize();
  const handleMaximize = async () => {
    if (await appWindow.isMaximized()) {
      appWindow.unmaximize();
    } else {
      appWindow.maximize();
    }
  };
  const handleClose = () => appWindow.close();

  return (
    <div
      className="h-9 bg-surface flex items-center justify-between select-none border-b border-border relative z-20"
      data-tauri-drag-region
    >
      <div className="flex items-center gap-2 px-3" data-tauri-drag-region>
        <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">R</span>
        </div>
        <span className="text-sm font-medium text-text">RunDeck</span>
      </div>

      <div className="flex">
        <button
          onClick={handleMinimize}
          className="w-11 h-9 flex items-center justify-center hover:bg-surface-hover transition-colors"
        >
          <Minus className="w-4 h-4 text-text-muted" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-11 h-9 flex items-center justify-center hover:bg-surface-hover transition-colors"
        >
          <Square className="w-3 h-3 text-text-muted" />
        </button>
        <button
          onClick={handleClose}
          className="w-11 h-9 flex items-center justify-center hover:bg-error transition-colors"
        >
          <X className="w-4 h-4 text-text-muted hover:text-white" />
        </button>
      </div>
    </div>
  );
}
