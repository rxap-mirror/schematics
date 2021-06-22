import { Tree } from '@angular-devkit/schematics';
import { join } from 'path';
import { GetProjectPackageJson, GetProjectRoot } from './get-project';
import { GuessSchematicRoot } from './guess-schematic-root';

export function GetSchematicRoot(host: Tree, projectName: string): string | null {
  const projectRoot = GetProjectRoot(host, projectName);
  const projectPackageJson = GetProjectPackageJson(host, projectName);
  let schematicRoot: string | null = null;

  if (projectPackageJson.schematics) {
    if (host.exists(join(projectRoot, projectPackageJson.schematics))) {
      schematicRoot = join(projectRoot, GuessSchematicRoot(host, projectName));
    }
  }

  return schematicRoot;
}
