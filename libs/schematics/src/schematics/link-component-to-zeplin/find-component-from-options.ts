import { Tree } from '@angular-devkit/schematics';
import { dirname, normalize, NormalizedRoot, Path } from '@angular-devkit/core';
import { join } from 'path';

export const COMPONENT_EXT = '.component.ts';

export interface ComponentOptions {
  component?: string;
  name: string;
  path?: string;
  componentExt?: string;
}

/**
 * Find the module referred by a set of options passed to the schematics.
 */
export function findComponentFromOptions(host: Tree, options: ComponentOptions): Path | undefined {

  const componentExt          = options.componentExt || COMPONENT_EXT;
  const componentNameFragment = options.component ?? options.name;

  const startSearchPath = normalize(`/${options.path}/${options.name}`);

  const candidatePaths = [];

  for (let dir = startSearchPath; dir !== NormalizedRoot; dir = dirname(dir)) {
    candidatePaths.push(dir);
  }

  const candidateFileSuffixes = [
    '',
    `${componentNameFragment}${componentExt}`,
    `${componentNameFragment}.ts`
  ];

  for (const candidatePath of candidatePaths) {
    for (const candidateFileSuffix of candidateFileSuffixes) {
      const candidateFile = join(candidatePath, candidateFileSuffix);
      if (host.exists(candidateFile)) {
        return normalize(candidateFile);
      }
    }
  }

}
