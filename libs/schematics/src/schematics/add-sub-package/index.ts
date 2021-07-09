import { apply, chain, mergeWith, move, Rule, template, Tree, url, } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { AddSubPackage } from '../schema';
import { buildDefaultPath, getWorkspace, } from '../utilities';
import { join, relative, } from 'path';
import { GetNxJson } from '@rxap/schematics-utilities';

export default function(schema: AddSubPackage): Rule {

  return async (host: Tree) => {
    const workspace = await getWorkspace(host);
    const project   = workspace.projects.get(schema.project as string);

    let basePath = schema.path;

    if (basePath === undefined && project) {
      basePath = buildDefaultPath(project).replace('/src/lib', '').replace(/^\//, '');
    }

    return chain([
      mergeWith(
        apply(url('./files'), [
          template({
            ...strings,
            ...schema
          }),
          move(basePath!)
        ])
      ),
      (rule: Tree) => {

        // support für angular 10
        const tsConfigFilePath = rule.exists('tsconfig.base.json') ? 'tsconfig.base.json' : 'tsconfig.json';

        if (!rule.exists(tsConfigFilePath)) {
          throw new Error(`Could not find /${tsConfigFilePath}`);
        }

        const tsConfig = JSON.parse(rule.read(tsConfigFilePath)!.toString('utf-8'));

        let packageName: string;

        if (rule.exists(join(project!.root, 'package.json'))) {

          const packageJson = JSON.parse(rule.read(join(project!.root, 'package.json'))!.toString());

          packageName = packageJson.name;

        } else if (schema.project) {

          const nxJson = GetNxJson(host);

          packageName = join(nxJson.npmScope, schema.project);

        } else {
          throw new Error('Could not extract the project import name. The project has not a package.json and the project name is not provided as parameter.');
        }

        const baseSubPackageName = relative(project!.root, basePath!);

        const subPackageName = join(baseSubPackageName, schema.name!);

        const tsConfigPath     = join(packageName, subPackageName);
        const tsConfigPathItem = join(basePath!, subPackageName, 'src', 'public_api.ts');

        tsConfig.compilerOptions.paths[ tsConfigPath ] = [ tsConfigPathItem ];

        rule.overwrite(tsConfigFilePath, JSON.stringify(tsConfig, null, 2));
      }
    ]);

  };
}
