import type { RunConfig } from '@/types';

interface SpringBootRunXml {
  mainClass?: string;
  vmParameters?: string;
  activeProfiles?: string;
  envVariables?: Record<string, string>;
  workingDirectory?: string;
}

/**
 * Parse IntelliJ Spring Boot .run.xml configuration files
 */
export function parseSpringBootRunXml(xmlContent: string): SpringBootRunXml | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'text/xml');

    const configuration = doc.querySelector('configuration');
    if (!configuration) return null;

    const result: SpringBootRunXml = {};

    // Main class
    const mainClassOption = configuration.querySelector('option[name="MAIN_CLASS_NAME"]');
    if (mainClassOption) {
      result.mainClass = mainClassOption.getAttribute('value') || undefined;
    }

    // VM parameters
    const vmParamsOption = configuration.querySelector('option[name="VM_PARAMETERS"]');
    if (vmParamsOption) {
      result.vmParameters = vmParamsOption.getAttribute('value') || undefined;
    }

    // Active profiles
    const profilesOption = configuration.querySelector('option[name="SPRING_BOOT_ACTIVE_PROFILES"]');
    if (profilesOption) {
      result.activeProfiles = profilesOption.getAttribute('value') || undefined;
    }

    // Environment variables
    const envs = configuration.querySelector('envs');
    if (envs) {
      result.envVariables = {};
      const envEntries = envs.querySelectorAll('env');
      envEntries.forEach((env) => {
        const name = env.getAttribute('name');
        const value = env.getAttribute('value');
        if (name && value) {
          result.envVariables![name] = value;
        }
      });
    }

    // Working directory
    const workDirOption = configuration.querySelector('option[name="WORKING_DIRECTORY"]');
    if (workDirOption) {
      result.workingDirectory = workDirOption.getAttribute('value') || undefined;
    }

    return result;
  } catch {
    console.error('Failed to parse Spring Boot run XML');
    return null;
  }
}

/**
 * Convert parsed IntelliJ config to RunDeck config
 */
export function convertToRunConfig(
  parsed: SpringBootRunXml,
  name: string
): Partial<RunConfig> {
  const args: string[] = [];

  if (parsed.activeProfiles) {
    args.push(`--spring.profiles.active=${parsed.activeProfiles}`);
  }

  if (parsed.vmParameters) {
    // VM params would need to be handled differently in actual execution
    // For now, we'll store them as environment variables
  }

  return {
    name,
    type: 'spring-boot',
    workingDir: parsed.workingDirectory?.replace('$PROJECT_DIR$', '.'),
    env: parsed.envVariables || {},
    args,
  };
}
