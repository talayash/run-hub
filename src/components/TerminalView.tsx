import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useProcessStore } from '@/stores/processStore';
import '@xterm/xterm/css/xterm.css';

interface TerminalViewProps {
  configId: string;
  isActive: boolean;
}

export function TerminalView({ configId, isActive }: TerminalViewProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const clearVersion = useProcessStore((state) => state.clearVersion[configId] || 0);

  const handleResize = useCallback(() => {
    if (fitAddonRef.current && xtermRef.current) {
      fitAddonRef.current.fit();
      const { cols, rows } = xtermRef.current;
      invoke('resize_pty', { id: configId, cols, rows }).catch(console.error);
    }
  }, [configId]);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

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
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      fontSize: 13,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 10000,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(searchAddon);
    terminal.loadAddon(webLinksAddon);

    terminal.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Handle keyboard input
    terminal.onData((data) => {
      invoke('write_to_process', { id: configId, data }).catch(console.error);
    });

    // Listen for PTY output
    const unlistenPromise = listen<{ id: string; data: string }>(
      'pty-output',
      (event) => {
        if (event.payload.id === configId) {
          terminal.write(event.payload.data);
        }
      }
    );

    // Handle window resize
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(terminalRef.current);

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
      resizeObserver.disconnect();
      terminal.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
  }, [configId, handleResize]);

  useEffect(() => {
    if (isActive) {
      handleResize();
      xtermRef.current?.focus();
    }
  }, [isActive, handleResize]);

  // Clear terminal when clearVersion changes
  useEffect(() => {
    if (clearVersion > 0 && xtermRef.current) {
      xtermRef.current.clear();
    }
  }, [clearVersion]);

  return (
    <div
      ref={terminalRef}
      className={`h-full w-full ${isActive ? '' : 'hidden'}`}
      style={{ padding: '8px' }}
    />
  );
}
