import { chain, externalSchematic, noop, Rule, schematic, SchematicsException, } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { CheckIfPackagesAreInstalled } from '@rxap/schematics-utilities';
import { AddBuildTarget } from './add-build-target';
import { SchematicProjectSchema } from './schema';

export default function (options: SchematicProjectSchema): Rule {

  if (!options.project) {
    if (!options.name) {
      throw new SchematicsException('The option name is required!');
    }
    if (!options.importPath) {
      throw new SchematicsException('The option importPath is required!');
    }
  }

  return () => {
    const projectName = options.project ?? strings.dasherize([ options.directory, options.name ].filter(Boolean).join('-'));
    return chain([
      options.project ? noop() : externalSchematic('@nrwl/node', 'library', {
        name: options.name,
        directory: options.directory,
        linter: options.linter,
        unitTestRunner: options.unitTestRunner,
        tags: options.tags,
        skipFormat: options.skipFormat,
        skipTsConfig: options.skipTsConfig,
        importPath: options.importPath,
        rootDir: options.rootDir,
        testEnvironment: options.testEnvironment,
        babelJest: options.babelJest,
        pascalCaseFiles: options.pascalCaseFiles,
        js: options.js,
        strict: options.strict,
        buildable: true,
        publishable: true,
      }),
      AddBuildTarget(projectName),
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
        builders: options.builders ?? false,
        updatePackageGroup: true,
        updatePeerDependencies: true,
      }),
      schematic('config-ng-add', { project: projectName }),
      schematic('config-package-json', { project: projectName }),
    ]);
  }
}
