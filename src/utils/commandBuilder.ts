import type { RunConfig } from '@/types';

interface CommandResult {
  command: string;
  args: string[];
}

export function buildCommand(config: RunConfig): CommandResult {
  switch (config.type) {
    case 'shell':
      return buildShellCommand(config);
    case 'gradle':
      return buildGradleCommand(config);
    case 'maven':
      return buildMavenCommand(config);
    case 'node':
      return buildNodeCommand(config);
    case 'docker':
      return buildDockerCommand(config);
    case 'spring-boot':
      return buildSpringBootCommand(config);
    default:
      return buildShellCommand(config);
  }
}

function buildShellCommand(config: RunConfig): CommandResult {
  if (!config.command) {
    return { command: 'powershell.exe', args: [] };
  }

  // For shell type, run the command through powershell
  return {
    command: 'powershell.exe',
    args: ['-NoExit', '-Command', config.command, ...config.args],
  };
}

function buildGradleCommand(config: RunConfig): CommandResult {
  const task = config.command || 'build';
  // Check for gradlew.bat first (wrapper), fallback to gradle
  return {
    command: 'cmd.exe',
    args: [
      '/c',
      `if exist gradlew.bat (.\\gradlew.bat ${task} ${config.args.join(' ')}) else (gradle ${task} ${config.args.join(' ')})`,
    ],
  };
}

function buildMavenCommand(config: RunConfig): CommandResult {
  const goal = config.command || 'compile';
  // Check for mvnw.cmd first (wrapper), fallback to mvn
  return {
    command: 'cmd.exe',
    args: [
      '/c',
      `if exist mvnw.cmd (.\\mvnw.cmd ${goal} ${config.args.join(' ')}) else (mvn ${goal} ${config.args.join(' ')})`,
    ],
  };
}

function buildNodeCommand(config: RunConfig): CommandResult {
  const script = config.command || 'start';
  // Detect package manager based on lock files
  return {
    command: 'cmd.exe',
    args: [
      '/c',
      `if exist pnpm-lock.yaml (pnpm ${script} ${config.args.join(' ')}) else if exist yarn.lock (yarn ${script} ${config.args.join(' ')}) else (npm run ${script} ${config.args.join(' ')})`,
    ],
  };
}

function buildDockerCommand(config: RunConfig): CommandResult {
  const composeFile = config.command || 'docker-compose.yml';
  return {
    command: 'docker',
    args: ['compose', '-f', composeFile, 'up', ...config.args],
  };
}

function buildSpringBootCommand(config: RunConfig): CommandResult {
  // Default to using Gradle bootRun
  return {
    command: 'cmd.exe',
    args: [
      '/c',
      `if exist gradlew.bat (.\\gradlew.bat bootRun ${config.args.join(' ')}) else if exist mvnw.cmd (.\\mvnw.cmd spring-boot:run ${config.args.join(' ')}) else (gradle bootRun ${config.args.join(' ')})`,
    ],
  };
}
