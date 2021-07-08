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
  HasProject,
  InstallNodePackages,
  UpdateAngularJson
} from '@rxap/schematics-utilities';
import { DeleteExistingApp } from './delete-existing-app';
import { AddFeaturesIndexTheme } from './add-features-index-theme';

const { dasherize } = strings;

export default function (options: PwaInitSchema): Rule {

  return async (host: Tree) => {

    const port = Math.floor(Math.random() * 1000) + 4000;

    const projectName = options.project;
    const hasProject = HasProject(host, projectName);
    const projectRoot = hasProject ? GetProjectRoot(host, projectName) : join('apps', dasherize(projectName));
    const projectSourceRoot = hasProject ? GetProjectRoot(host, projectName) : join(projectRoot, 'src');
    const prefix = hasProject ? GetProjectPrefix(host, projectName) : GetNxJson(host).npmScope;

    return chain([
      schematic('library-shared', {}),
      hasProject ? noop() : chain([
        externalSchematic('@nrwl/angular', 'application', {
          name: projectName,
          enableIvy: true,
          routing: false,
          style: 'scss',
          unitTestRunner: 'jest',
          e2eTestRunner: 'cypress',
          skipTests: true
        }),
      ]),
      !hasProject || options.overwrite ? DeleteExistingApp(projectSourceRoot) : noop(),
      AddFeaturesIndexTheme(),
      UpdateAngularJson(angular => {
        const project = angular.projects.get(projectName);
        if (project) {
          const buildTarget = project.targets.get('build');
          if (buildTarget) {
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
            return null;
          }
          return entry;
        }),
      ])),
      !hasProject || options.overwrite ? chain([
        AddPackageJsonDependency('@rxap/config'),
        AddPackageJsonDependency('@rxap/environment'),
        AddPackageJsonDependency('normalize.css'),
        AddPackageJsonDependency('@angular/material'),
        externalSchematic('@angular/material', 'ng-add', {
          project: projectName,
          theme: 'custom',
          typography: true,
          animations: true,
        }),
        externalSchematic('@rxap/config', 'ng-add', { project: projectName }),
        externalSchematic('@rxap/environment', 'ng-add', { project: projectName }),
      ]) : noop(),
      AddPackageJsonScript('start:browser', `chromium --allow-file-access-from-files --disable-web-security --user-data-dir="./chromium-user-data" http://localhost:${port}`),
      AddPackageJsonScript('start', `nx serve --port ${port}`),
      InstallNodePackages(),
    ]);

  };

}
