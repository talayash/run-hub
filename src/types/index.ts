export interface RunConfig {
  id: string;
  name: string;
  type: ConfigType;
  command?: string;
  workingDir?: string;
  env: Record<string, string>;
  args: string[];
  folderId?: string;
  color?: string;
  autoRestart: boolean;
  restartDelay: number;
  maxRetries: number;
}

export type ConfigType =
  | 'shell'
  | 'gradle'
  | 'maven'
  | 'node'
  | 'docker'
  | 'spring-boot';

export interface Folder {
  id: string;
  name: string;
  color?: string;
  expanded: boolean;
}

export interface ProcessState {
  status: ProcessStatus;
  exitCode?: number;
  startedAt?: number;
  restartCount: number;
}

export type ProcessStatus = 'stopped' | 'starting' | 'running' | 'error';

export interface AppConfig {
  configs: RunConfig[];
  folders: Folder[];
  configOrder: string[];
}
