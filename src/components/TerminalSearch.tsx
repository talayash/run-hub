import { useState, useRef, useEffect, useCallback } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SearchAddon } from '@xterm/addon-search';

interface TerminalSearchProps {
  searchAddon: SearchAddon | null;
  onClose: () => void;
}

export function TerminalSearch({ searchAddon, onClose }: TerminalSearchProps) {
  const [query, setQuery] = useState('');
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = useCallback((direction: 'next' | 'previous') => {
    if (!searchAddon || !query) return;

    const options = {
      caseSensitive: false,
      wholeWord: false,
      regex: false,
      incremental: direction === 'next',
    };

    if (direction === 'next') {
      searchAddon.findNext(query, options);
    } else {
      searchAddon.findPrevious(query, options);
    }
  }, [searchAddon, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        handleSearch('previous');
      } else {
        handleSearch('next');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (searchAddon && newQuery) {
      searchAddon.findNext(newQuery, {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
        incremental: true,
      });
    } else if (searchAddon) {
      searchAddon.clearDecorations();
      setMatchCount(null);
    }
  };

  const handleClose = () => {
    if (searchAddon) {
      searchAddon.clearDecorations();
    }
    onClose();
  };

  return (
    <div className="absolute top-2 right-4 z-50 flex items-center gap-1 bg-surface border border-border rounded-md px-2 py-1 shadow-lg">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
        className="bg-transparent border-none outline-none text-sm text-text w-48 placeholder:text-text-muted"
      />
      {matchCount !== null && (
        <span className="text-xs text-text-muted mr-1">
          {matchCount} matches
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={() => handleSearch('previous')}
        disabled={!query}
        title="Previous (Shift+Enter)"
      >
        <ChevronUp className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={() => handleSearch('next')}
        disabled={!query}
        title="Next (Enter)"
      >
        <ChevronDown className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={handleClose}
        title="Close (Escape)"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
