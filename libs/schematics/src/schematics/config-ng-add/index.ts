import { Schema } from './schema';
import {
  apply,
  applyTemplates,
  chain,
  forEach,
  mergeWith,
  move,
  noop,
  Rule,
  Tree,
  url
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import {
  AssertProjectType,
  GetProjectCollectionJson,
  GetProjectPackageJson,
  GetProjectRoot,
  UpdatePackageJson
} from '@rxap/schematics-utilities';
import { dirname, join } from 'path';

export function GuessSchematicRoot(host: Tree, projectName: string): string {

  const collectionJson = GetProjectCollectionJson(host, projectName);

  if (Object.keys(collectionJson.schematics).length) {
    const firstSchematic = collectionJson.schematics[Object.keys(collectionJson.schematics)[0]];
    const basePathSegmentList: string[] = [];
    for (const segment of firstSchematic.factory.split('/')) {
      basePathSegmentList.push(segment);
      if (segment === 'schematics' || segment === 'schematic') {
        break;
      }
    }
    return basePathSegmentList.join('/');
  }

  return 'src/schematics';

}

export default function (options: Schema): Rule {
  return (host, context) => {

    console.log(join(dirname(require.resolve(join(context.schematic.description.collection.name, 'package.json'))), 'package.json'));

    AssertProjectType(host, options.name, 'library');

    const projectRoot = GetProjectRoot(host, options.name);

    const projectPackageJson = GetProjectPackageJson(host, options.name);

    let hasSchematics = false;
    let schematicRoot: string | null = null;

    if (projectPackageJson.schematics) {
      if (host.exists(join(projectRoot, projectPackageJson.schematics))) {
        hasSchematics = true;
        schematicRoot = join(projectRoot, GuessSchematicRoot(host, options.name));
      }
    }

    if (hasSchematics) {
      console.log(`The project ${options.name} has schematics. The ng-add schematic will be added if not exists.`);
    } else {
      console.warn(`The project ${options.name} does **not** have schematics. The ng-add schematic will **not** ne added.`);
    }

    return chain([
      hasSchematics ? mergeWith(apply(url('./files'), [
        applyTemplates({
          id: strings.dasherize(projectPackageJson.name),
        }),
        move(schematicRoot),
        forEach(entry => {
          if (host.exists(entry.path)) {
            return null
          }
          return entry;
        })
      ])) : noop(),
      UpdatePackageJson(packageJson => {

        if (!packageJson['ng-add']) {
          packageJson['ng-add'] = {};
        }

        if (options.save === 'false') {
          packageJson['ng-add'].save = false;
        } else {
          packageJson['ng-add'].save = options.save ?? true;
        }

      }, projectRoot)
    ]);

  }
}
