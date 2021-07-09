import { strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  externalSchematic,
  forEach,
  mergeWith,
  move,
  noop,
  Rule,
  schematic,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { join } from 'path';
import { PwaInitSchema } from './schema';
import {
  AddPackageJsonDependency,
  AddPackageJsonScript,
  GetNxJson,
  GetProjectPrefix,
  GetProjectRoot,
  GetProjectSourceRoot,
  HasProject,
  UpdateAngularJson
} from '@rxap/schematics-utilities';
import { DeleteExistingApp } from './delete-existing-app';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';
import { TaskId } from '@angular-devkit/schematics/src/engine';

const { dasherize } = strings;

export default function (options: PwaInitSchema): Rule {

  return async (host: Tree) => {

    const port = Math.floor(Math.random() * 1000) + 4000;

    const projectName = options.project;
    const hasProject = HasProject(host, projectName);
    const projectRoot = hasProject ? GetProjectRoot(host, projectName) : join('apps', dasherize(projectName));
    const projectSourceRoot = hasProject ? GetProjectSourceRoot(host, projectName) : join(projectRoot, 'src');
    const prefix = hasProject ? GetProjectPrefix(host, projectName) : GetNxJson(host).npmScope;

    const installTaskIdList: TaskId[] = [];

    if (!hasProject) {
      options.overwrite = true;
    }

    return chain([
      hasProject ? noop() : chain([
        externalSchematic('@nrwl/angular', 'application', {
          name: projectName,
          enableIvy: true,
          routing: false,
          style: 'scss',
          unitTestRunner: 'jest',
          e2eTestRunner: 'cypress',
          skipTests: true
        })
      ]),
      schematic('library-shared', {}),
      options.overwrite ? DeleteExistingApp(projectSourceRoot) : noop(),
      UpdateAngularJson(angular => {
        const project = angular.projects.get(projectName);
        if (project) {
          const buildTarget = project.targets.get('build');
          if (buildTarget) {
            if (!buildTarget.options.assets) {
              buildTarget.options.assets = [];
            }
            const assets: string[] = buildTarget.options.assets;
            [ 'manifest.webmanifest', 'build.json' ].forEach(file => {
              const fullPath = join(projectSourceRoot, file);
              if (!assets.includes(fullPath)) {
                assets.push(fullPath);
              }
            });
            if (!buildTarget.configurations) {
              buildTarget.configurations = {};
            }
            const production = buildTarget.configurations.production ?? {};
            buildTarget.configurations.master = {
              ...production,
              fileReplacements: [
                {
                  replace: join(projectSourceRoot, 'environments/environment.ts'),
                  with: join(projectSourceRoot, 'environments/environment.master.ts')
                }
              ],
              sourceMap: true,
              namedChunks: true,
              vendorChunk: true,
              budgets: []
            }
            buildTarget.configurations['merge-request'] = {
              ...production,
              fileReplacements: [
                {
                  replace: join(projectSourceRoot, 'environments/environment.ts'),
                  with: join(projectSourceRoot, 'environments/environment.merge-request.ts')
                }
              ],
              sourceMap: true,
              namedChunks: true,
              vendorChunk: true,
              budgets: []
            }
            buildTarget.configurations['e2e'] = {
              ...production,
              fileReplacements: [
                {
                  replace: join(projectSourceRoot, 'environments/environment.ts'),
                  with: join(projectSourceRoot, 'environments/environment.e2e.ts')
                }
              ],
              sourceMap: true,
              namedChunks: true,
              vendorChunk: true,
              budgets: []
            }
          }
        }
      }),
      mergeWith(apply(url('./files'), [
        template({ prefix, ...strings, project: projectName }),
        move(projectSourceRoot),
        forEach(entry => {
          if (host.exists(entry.path)) {
            if (options.overwrite) {
              host.overwrite(entry.path, entry.content);
            }
            return null;
          }
          return entry;
        }),
      ])),
      options.overwrite ? chain([
        AddPackageJsonDependency('@rxap/config'),
        AddPackageJsonDependency('@rxap/environment'),
        AddPackageJsonDependency('normalize.css'),
        options.material ? AddPackageJsonDependency('@angular/material') : noop(),
        (_, context) => {
          installTaskIdList.push(context.addTask(
            new NodePackageInstallTask(),
            // slice the array to private any circular dependencies
            installTaskIdList.slice()
          ));
          if (options.material) {
            installTaskIdList.push(context.addTask(new RunSchematicTask('@angular/material', 'ng-add', {
                project: projectName,
                theme: 'custom',
                typography: true,
                animations: true,
              }),
              // slice the array to private any circular dependencies
              installTaskIdList.slice())
            );
            context.addTask(new RunSchematicTask('init-custom-material-theme', {
              project: projectName,
              overwrite: options.overwrite
            }), installTaskIdList);
          }
          context.addTask(new RunSchematicTask('@rxap/config', 'ng-add', { project: projectName }), installTaskIdList);
          context.addTask(new RunSchematicTask('@rxap/environment', 'ng-add', { project: projectName }), installTaskIdList);
        },
      ]) : noop(),
      AddPackageJsonScript('start:browser', `chromium --allow-file-access-from-files --disable-web-security --user-data-dir="./chromium-user-data" http://localhost:${port}`),
      AddPackageJsonScript('start', `nx serve --port ${port}`),
    ]);

  };

}
