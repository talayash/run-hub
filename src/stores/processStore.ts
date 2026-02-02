import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { ProcessState, ProcessStatus, RunConfig } from '@/types';
import { buildCommand } from '@/utils/commandBuilder';

interface ProcessStore {
  processes: Record<string, ProcessState>;
  activeConfigId: string | null;
  terminalOutputs: Record<string, string[]>;
  clearVersion: Record<string, number>;

  setActiveConfig: (id: string | null) => void;

  startProcess: (config: RunConfig) => Promise<void>;
  stopProcess: (id: string) => Promise<void>;
  restartProcess: (config: RunConfig) => Promise<void>;

  updateProcessStatus: (id: string, status: ProcessStatus, exitCode?: number) => void;
  appendOutput: (id: string, data: string) => void;
  clearOutput: (id: string) => void;

  initListeners: () => Promise<() => void>;
}

export const useProcessStore = create<ProcessStore>((set, get) => ({
  processes: {},
  activeConfigId: null,
  terminalOutputs: {},
  clearVersion: {},

  setActiveConfig: (id) => set({ activeConfigId: id }),

  startProcess: async (config) => {
    const { id } = config;
    const { command, args } = buildCommand(config);

    set((state) => ({
      processes: {
        ...state.processes,
        [id]: {
          status: 'starting',
          startedAt: Date.now(),
          restartCount: state.processes[id]?.restartCount || 0,
        },
      },
      terminalOutputs: {
        ...state.terminalOutputs,
        [id]: state.terminalOutputs[id] || [],
      },
    }));

    try {
      await invoke('spawn_process', {
        config: {
          id,
          command,
          args,
          working_dir: config.workingDir,
          env: config.env,
        },
      });

      set((state) => ({
        processes: {
          ...state.processes,
          [id]: {
            ...state.processes[id],
            status: 'running',
          },
        },
      }));
    } catch (error) {
      console.error('Failed to start process:', error);
      set((state) => ({
        processes: {
          ...state.processes,
          [id]: {
            ...state.processes[id],
            status: 'error',
          },
        },
      }));
    }
  },

  stopProcess: async (id) => {
    try {
      await invoke('kill_process', { id });
      set((state) => ({
        processes: {
          ...state.processes,
          [id]: {
            ...state.processes[id],
            status: 'stopped',
          },
        },
      }));
    } catch (error) {
      console.error('Failed to stop process:', error);
    }
  },

  restartProcess: async (config) => {
    const { startProcess } = get();

    // Always try to kill the process first to clean up any lingering PTY
    try {
      await invoke('kill_process', { id: config.id });
    } catch {
      // Ignore errors - process might not exist
    }

    // Brief delay to ensure cleanup is complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    set((state) => ({
      processes: {
        ...state.processes,
        [config.id]: {
          ...state.processes[config.id],
          status: 'stopped',
          restartCount: (state.processes[config.id]?.restartCount || 0) + 1,
        },
      },
    }));

    await startProcess(config);
  },

  updateProcessStatus: (id, status, exitCode) => {
    set((state) => ({
      processes: {
        ...state.processes,
        [id]: {
          ...state.processes[id],
          status,
          exitCode,
        },
      },
    }));
  },

  appendOutput: (id, data) => {
    set((state) => ({
      terminalOutputs: {
        ...state.terminalOutputs,
        [id]: [...(state.terminalOutputs[id] || []), data],
      },
    }));
  },

  clearOutput: (id) => {
    set((state) => ({
      terminalOutputs: {
        ...state.terminalOutputs,
        [id]: [],
      },
      clearVersion: {
        ...state.clearVersion,
        [id]: (state.clearVersion[id] || 0) + 1,
      },
    }));
  },

  initListeners: async () => {
    const unlistenOutput = await listen<{ id: string; data: string }>(
      'pty-output',
      (event) => {
        get().appendOutput(event.payload.id, event.payload.data);
      }
    );

    const unlistenExit = await listen<{ id: string; code: number | null }>(
      'pty-exit',
      (event) => {
        const status: ProcessStatus = event.payload.code === 0 ? 'stopped' : 'error';
        get().updateProcessStatus(event.payload.id, status, event.payload.code ?? undefined);
      }
    );

    return () => {
      unlistenOutput();
      unlistenExit();
    };
  },
}));
