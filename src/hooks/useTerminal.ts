import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { TerminalBuffer } from '@/utils/terminalBuffer';
import { useSettingsStore } from '@/stores/settingsStore';

interface UseTerminalOptions {
  configId: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isActive: boolean;
}

interface UseTerminalReturn {
  terminal: Terminal | null;
  fitAddon: FitAddon | null;
  searchAddon: SearchAddon | null;
  clear: () => void;
  search: (query: string) => boolean;
  searchNext: () => boolean;
  searchPrevious: () => boolean;
}

export function useTerminal({
  configId,
  containerRef,
  isActive,
}: UseTerminalOptions): UseTerminalReturn {
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const searchAddonRef = useRef<SearchAddon | null>(null);
  const bufferRef = useRef<TerminalBuffer | null>(null);
  const unlistenRef = useRef<UnlistenFn | null>(null);

  const settings = useSettingsStore();

  const handleResize = useCallback(() => {
    if (fitAddonRef.current && terminalRef.current) {
      try {
        fitAddonRef.current.fit();
        const { cols, rows } = terminalRef.current;
        invoke('resize_pty', { id: configId, cols, rows }).catch(console.error);
      } catch {
        // Ignore resize errors
      }
    }
  }, [configId]);

  useEffect(() => {
    if (!containerRef.current || terminalRef.current) return;

    const terminal = new Terminal({
      theme: {
        background: '#1a1a2e',
        foreground: '#e4e4e7',
        cursor: '#3b82f6',
        cursorAccent: '#1a1a2e',
        selectionBackground: '#3b82f680',
        black: '#1a1a2e',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#f59e0b',
        blue: '#3b82f6',
        magenta: '#8b5cf6',
        cyan: '#06b6d4',
        white: '#e4e4e7',
        brightBlack: '#52525b',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#fbbf24',
        brightBlue: '#60a5fa',
        brightMagenta: '#a78bfa',
        brightCyan: '#22d3ee',
        brightWhite: '#fafafa',
      },
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
      lineHeight: 1.2,
      cursorBlink: settings.cursorBlink,
      cursorStyle: settings.cursorStyle,
      scrollback: settings.scrollback,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(searchAddon);
    terminal.loadAddon(webLinksAddon);

    terminal.open(containerRef.current);
    fitAddon.fit();

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;
    searchAddonRef.current = searchAddon;

    // Create output buffer for performance
    const buffer = new TerminalBuffer((data) => {
      terminal.write(data);
    });
    bufferRef.current = buffer;

    // Handle keyboard input
    terminal.onData((data) => {
      invoke('write_to_process', { id: configId, data }).catch(console.error);
    });

    // Listen for PTY output
    listen<{ id: string; data: string }>('pty-output', (event) => {
      if (event.payload.id === configId) {
        buffer.write(event.payload.data);
      }
    }).then((unlisten) => {
      unlistenRef.current = unlisten;
    });

    // Handle window resize
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (unlistenRef.current) {
        unlistenRef.current();
        unlistenRef.current = null;
      }
      resizeObserver.disconnect();
      buffer.dispose();
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
      searchAddonRef.current = null;
      bufferRef.current = null;
    };
  }, [configId, containerRef, handleResize, settings.fontFamily, settings.fontSize, settings.cursorBlink, settings.cursorStyle, settings.scrollback]);

  useEffect(() => {
    if (isActive) {
      handleResize();
      terminalRef.current?.focus();
    }
  }, [isActive, handleResize]);

  const clear = useCallback(() => {
    terminalRef.current?.clear();
  }, []);

  const search = useCallback((query: string) => {
    return searchAddonRef.current?.findNext(query) ?? false;
  }, []);

  const searchNext = useCallback(() => {
    return searchAddonRef.current?.findNext('') ?? false;
  }, []);

  const searchPrevious = useCallback(() => {
    return searchAddonRef.current?.findPrevious('') ?? false;
  }, []);

  return {
    terminal: terminalRef.current,
    fitAddon: fitAddonRef.current,
    searchAddon: searchAddonRef.current,
    clear,
    search,
    searchNext,
    searchPrevious,
  };
}
