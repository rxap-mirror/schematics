import { chain, externalSchematic, noop, Rule, schematic, SchematicsException, } from '@angular-devkit/schematics';
import { AngularLibraryProjectSchema } from './schema'
import {
  CheckIfPackagesAreInstalled,
  DeleteRecursive,
  GetProjectCollectionJson,
  GuessSchematicRoot
} from '@rxap/schematics-utilities';
import { strings } from '@angular-devkit/core';
import { join } from 'path';

export default function (options: AngularLibraryProjectSchema): Rule {

  if (!options.project) {
    if (!options.name) {
      throw new SchematicsException('The option name is required!');
    }
    if (!options.importPath) {
      throw new SchematicsException('The option importPath is required!');
    }
  }

  return async () => {
    const projectName = options.project ?? strings.dasherize([ options.directory, options.name ].filter(Boolean).join('-'));
    return chain([
      options.project ? noop() : externalSchematic(
        '@nrwl/angular',
        'library',
        {
          name: options.name,
          skipFormat: options.skipFormat,
          simpleModuleName: options.simpleModuleName,
          addModuleSpec: options.addModuleSpec,
          directory: options.directory,
          sourceDir: options.sourceDir,
          buildable: true,
          publishable: true,
          importPath: options.importPath,

          spec: options.spec,
          flat: options.flat,
          commonModule: false,

          prefix: options.prefix,
          routing: false,
          lazy: false,
          parentModule: false,
          tags: options.tags,
          strict: options.strict,

          linter: options.linter,
          unitTestRunner: options.unitTestRunner,

          enableIvy: options.enableIvy,
        }
      ),
      CheckIfPackagesAreInstalled([
        '@rxap/plugin-pack',
        '@rxap/plugin-readme-generator',
        '@rxap/plugin-library',
      ]),
      externalSchematic('@rxap/plugin-pack', 'config', {
        project: projectName
      }),
      externalSchematic('@rxap/plugin-readme-generator', 'config', {
        project: projectName,
        type: 'library'
      }),
      externalSchematic('@rxap/plugin-library', 'config', {
        project: projectName,
        schematics: true,
        migrations: true,
        builders: false,
        updatePackageGroup: true,
        updatePeerDependencies: true,
      }),
      tree => {
        const collectionJson = GetProjectCollectionJson(tree, projectName);
        const schematicRoot = GuessSchematicRoot(tree, projectName);
        const rules: Rule[] = [];
        if (!collectionJson.schematics['ng-add'] || options.overwrite) {
          rules.push(schematic('config-ng-add', {
            project: projectName
          }));
          if (collectionJson.schematics['ng-add']) {
            DeleteRecursive(tree, tree.getDir(join(schematicRoot, 'ng-add')));
          }
        }
        return chain(rules);
      },
      schematic('config-package-json', { project: projectName }),
    ]);

  };

}
