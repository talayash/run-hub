/**
 * Strip ANSI escape codes from text
 * Handles colors, cursor movement, and other terminal sequences
 */
export function stripAnsi(text: string): string {
  // Match all ANSI escape sequences
  // - CSI sequences: ESC [ ... (parameters and commands)
  // - OSC sequences: ESC ] ... (operating system commands)
  // - Other escape sequences
  return text
    .replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '')  // CSI sequences
    .replace(/\x1B\][^\x07]*\x07/g, '')        // OSC sequences (bell terminated)
    .replace(/\x1B\][^\x1B]*\x1B\\/g, '')      // OSC sequences (ST terminated)
    .replace(/\x1B[PX^_].*?\x1B\\/g, '')       // DCS, SOS, PM, APC sequences
    .replace(/\x1B[@-Z\\-_]/g, '');            // Other escape sequences
}
