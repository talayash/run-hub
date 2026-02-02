import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Settings {
  // General
  startOnBoot: boolean;
  minimizeToTray: boolean;
  defaultShell: string;

  // Terminal
  fontFamily: string;
  fontSize: number;
  scrollback: number;
  cursorStyle: 'bar' | 'block' | 'underline';
  cursorBlink: boolean;

  // Appearance
  sidebarWidth: number;
  accentColor: string;
}

interface SettingsStore extends Settings {
  updateSettings: (updates: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  startOnBoot: false,
  minimizeToTray: true,
  defaultShell: 'powershell.exe',

  fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
  fontSize: 13,
  scrollback: 10000,
  cursorStyle: 'bar',
  cursorBlink: true,

  sidebarWidth: 280,
  accentColor: '#3b82f6',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateSettings: (updates) => set((state) => ({ ...state, ...updates })),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'rundeck-settings',
    }
  )
);
