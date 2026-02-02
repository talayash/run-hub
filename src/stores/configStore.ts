import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { RunConfig, Folder, AppConfig } from '@/types';

interface ConfigStore {
  configs: RunConfig[];
  folders: Folder[];
  configOrder: string[];
  isLoaded: boolean;

  loadConfig: () => Promise<void>;
  saveConfig: () => Promise<void>;

  addConfig: (config: RunConfig) => void;
  updateConfig: (id: string, updates: Partial<RunConfig>) => void;
  deleteConfig: (id: string) => void;
  duplicateConfig: (id: string) => RunConfig;

  addFolder: (folder: Folder) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  toggleFolder: (id: string) => void;

  reorderConfigs: (configOrder: string[]) => void;
  moveConfigToFolder: (configId: string, folderId: string | undefined) => void;
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
  configs: [],
  folders: [],
  configOrder: [],
  isLoaded: false,

  loadConfig: async () => {
    try {
      const appConfig = await invoke<AppConfig>('get_config');
      set({
        configs: appConfig.configs,
        folders: appConfig.folders,
        configOrder: appConfig.configOrder,
        isLoaded: true,
      });
    } catch (error) {
      console.error('Failed to load config:', error);
      set({ isLoaded: true });
    }
  },

  saveConfig: async () => {
    const { configs, folders, configOrder } = get();
    try {
      await invoke('set_config', {
        config: { configs, folders, configOrder },
      });
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  },

  addConfig: (config) => {
    set((state) => ({
      configs: [...state.configs, config],
      configOrder: [...state.configOrder, config.id],
    }));
    get().saveConfig();
  },

  updateConfig: (id, updates) => {
    set((state) => ({
      configs: state.configs.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
    get().saveConfig();
  },

  deleteConfig: (id) => {
    set((state) => ({
      configs: state.configs.filter((c) => c.id !== id),
      configOrder: state.configOrder.filter((cid) => cid !== id),
    }));
    get().saveConfig();
  },

  duplicateConfig: (id) => {
    const { configs, addConfig } = get();
    const original = configs.find((c) => c.id === id);
    if (!original) throw new Error('Config not found');

    const newConfig: RunConfig = {
      ...original,
      id: crypto.randomUUID(),
      name: `${original.name} (Copy)`,
    };
    addConfig(newConfig);
    return newConfig;
  },

  addFolder: (folder) => {
    set((state) => ({
      folders: [...state.folders, folder],
    }));
    get().saveConfig();
  },

  updateFolder: (id, updates) => {
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    }));
    get().saveConfig();
  },

  deleteFolder: (id) => {
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
      configs: state.configs.map((c) =>
        c.folderId === id ? { ...c, folderId: undefined } : c
      ),
    }));
    get().saveConfig();
  },

  toggleFolder: (id) => {
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === id ? { ...f, expanded: !f.expanded } : f
      ),
    }));
    get().saveConfig();
  },

  reorderConfigs: (configOrder) => {
    set({ configOrder });
    get().saveConfig();
  },

  moveConfigToFolder: (configId, folderId) => {
    set((state) => ({
      configs: state.configs.map((c) =>
        c.id === configId ? { ...c, folderId } : c
      ),
    }));
    get().saveConfig();
  },
}));
