import {
  apply,
  chain,
  externalSchematic,
  forEach,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicsException,
  template,
  url,
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { Schema } from '@nrwl/node/src/generators/library/schema';
import { DeleteRecursive, UpdateAngularJson, UpdateJsonFile, UpdatePackageJson } from '@rxap/schematics-utilities';
import { join, normalize, relative } from 'path';
import { unique } from '@rxap/utilities';

export function DeleteSrcFiles(projectRoot: string): Rule {
  return tree => {
    DeleteRecursive(tree, tree.getDir(join(projectRoot, 'src')));
    tree.create(join(projectRoot, 'src', 'index.ts'), 'export {};');
    tree.create(join(projectRoot, 'src', 'schematics', '.gitkeep'), '');
    tree.create(join(projectRoot, 'src', 'migrations', '.gitkeep'), '');
  }
}

export default function (options: Schema & { update?: boolean }): Rule {

  if (!options.update && !options.importPath) {
    throw new SchematicsException('The option importPath is required!');
  }

  return host => {
    const projectRoot = join('libs', options.directory ?? '', strings.dasherize(options.name));
    const relativePath = relative(normalize('/' + projectRoot), '/');
    return chain([
      options.update ? noop() : externalSchematic('@nrwl/node', 'library', {
        ...options,
        buildable: true,
        publishable: true,
      }),
      mergeWith(apply(url('./files'), [
        template({ relativePath }),
        move(projectRoot),
        forEach(entry => {
          if (host.exists(entry.path)) {
            return null
          }
          return entry;
        })
      ])),
      options.update ? noop() : DeleteSrcFiles(projectRoot),
      UpdateAngularJson(angular => {

        if (!angular.projects.has(options.name)) {
          throw new SchematicsException(`The project '${options.name}' does not exists`);
        }

        const project = angular.projects.get(options.name);

        if (!project.targets.has('build')) {
          project.targets.add('build', {
            builder: '@nrwl/node:package',
            options: {
              outputPath: join('dist', project.root),
              tsConfig: join(project.root, 'tsconfig.lib.json'),
              packageJson: join(project.root, 'package.json'),
              main: join(project.root, 'src/index.ts'),
              srcRootForCompilationRoot: project.root,
              assets: [],
            },
            outputs: [ '{options.outputPath}' ]
          } as any);
        }

        const target = project.targets.get('build');

        if (!Array.isArray(target.options.assets)) {
          target.options.assets = [];
        }

        if (!target.options.assets.includes(join(project.root, '*.md'))) {
          target.options.assets.push(join(project.root, '*.md'));
        }

        [ 'collection.json', 'migration.json' ].forEach(glob => {
          if (!target.options.assets.some(asset => typeof asset === 'object' && asset.glob === glob)) {
            target.options.assets.push({
              'input': `./${project.root}/src`,
              'glob': glob,
              'output': './src'
            });
          }
        });

        if (!target.options.assets.some(asset => typeof asset === 'object' && asset.glob === '**/*.!(ts)')) {
          target.options.assets.push({
            'input': `./${project.root}`,
            'glob': '**/*.!(ts)',
            'output': '.'
          });
        }

        target.options.buildableProjectDepsInPackageJsonType = 'dependencies';

      }),
      UpdatePackageJson(projectJson => {

        if (!projectJson['ng-update']) {
          projectJson['ng-update'] = {};
        }

        projectJson['ng-update'].migrations = './migration.json';

        if (!projectJson['ng-update'].packageGroup) {
          projectJson['ng-update'].packageGroup = [];
        }

        projectJson['ng-update'].packageGroup = [
          projectJson.name,
          ...projectJson['ng-update'].packageGroup,
        ].filter(unique());

        projectJson.schematics = './collection.json';

      }, projectRoot),
      UpdatePackageJson(packageJson => {
        const notInstalled = [].filter(packageName => !(packageJson.dependencies ?? {})[packageName] && !(packageJson.devDependencies ?? {})[packageName]);
        if (notInstalled.length) {
          console.error('Some required dev dependencies are not installed! Add the dependencies and run the schematic again');
          for (const packageName of notInstalled) {
            console.log(`ng add ${packageName}`);
          }
        }
      }),
      UpdateJsonFile(json => {
        if (!json.exclude) {
          json.exclude = [];
        }
        if (!json.exclude.includes('**/files/**')) {
          json.exclude.push('**/files/**');
        }
      }, join(projectRoot, 'tsconfig.lib.json')),
      externalSchematic('@rxap/plugin-pack', 'config', {
        project: options.name
      }),
      externalSchematic('@rxap/plugin-readme-generator', 'config', {
        project: options.name,
        type: 'library'
      }),
    ]);
  }
}
