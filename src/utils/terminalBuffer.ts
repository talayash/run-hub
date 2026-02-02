/**
 * Terminal output buffer with frame-based batching for performance
 */
export class TerminalBuffer {
  private buffer: string[] = [];
  private animationFrameId: number | null = null;
  private onFlush: (data: string) => void;
  private maxBufferSize: number;

  constructor(onFlush: (data: string) => void, maxBufferSize = 100) {
    this.onFlush = onFlush;
    this.maxBufferSize = maxBufferSize;
  }

  /**
   * Add data to the buffer
   */
  write(data: string): void {
    this.buffer.push(data);

    // Force flush if buffer is getting too large
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
      return;
    }

    // Schedule a frame-synced flush
    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  /**
   * Flush the buffer immediately
   */
  flush(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.buffer.length === 0) return;

    const data = this.buffer.join('');
    this.buffer = [];
    this.onFlush(data);
  }

  /**
   * Clear the buffer without flushing
   */
  clear(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.buffer = [];
  }

  /**
   * Dispose the buffer
   */
  dispose(): void {
    this.clear();
  }
}

/**
 * Debounce function for config saves
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle function for resize events
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
