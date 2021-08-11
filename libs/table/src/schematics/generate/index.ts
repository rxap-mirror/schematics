import { GenerateSchema } from './schema';
import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  forEach,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicsException,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { join } from 'path';
import { strings } from '@angular-devkit/core';
import { IndentationText, Project, QuoteKind } from 'ts-morph';
import { formatFiles } from '@nrwl/workspace';
import { TableSystemElements } from './elements/elements';
import { TableElement } from './elements/table.element';
import { ApplyTsMorphProject, FixMissingImports, } from '@rxap/schematics-ts-morph';
import { ParseTemplate } from '@rxap/schematics-xml-parser';
import { GetAngularJson, GetProjectRoot, GuessProjectName } from '@rxap/schematics-utilities';

const { dasherize } = strings;

export default function (options: GenerateSchema): Rule {

  return async (host: Tree) => {
    const projectName = options.project = GuessProjectName(host, options);
    const projectRootPath = GetProjectRoot(host, projectName);

    const basePathList: string[] = [];

    if (options.templateBasePath) {
      basePathList.push(options.templateBasePath);
    }
    if (options.path) {
      // Hack to go out of the templates base folder
      basePathList.push(join('..', options.path));
    }

    const tableElement = ParseTemplate<TableElement>(
      host,
      options.template,
      basePathList,
      ...TableSystemElements
    );

    options.name = options.name ?? tableElement.id;
    tableElement.id = options.name;

    if (!tableElement.id) {
      throw new Error('The table name/id is not defined!');
    }

    const project = new Project({
      useInMemoryFileSystem: true,
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
        quoteKind: QuoteKind.Single,
        useTrailingCommas: true,
      },
    });

    if (!options.openApiModule) {
      const angularJson = GetAngularJson(host);
      if (!angularJson.projects) {
        angularJson.projects = {}
      }
      if (Object.keys(angularJson.projects).includes('open-api')) {
        options.openApiModule = `@${angularJson.projects['open-api'].prefix}/open-api`;
      } else {
        if (angularJson.defaultProject) {
          options.openApiModule = `@${
            angularJson.projects[angularJson.defaultProject].prefix
          }/open-api`;
        } else {
          throw new SchematicsException('The default project is not defined');
        }
      }
    }

    let path: string = options.path ?? '';

    if (!options.path) {
      // TODO : check if lib or app should be used
      path = projectRootPath + '/src/lib';
    } else if (options.path[0] === '/') {
      path = join(projectRootPath + '/src/lib', options.path);
    }

    if (!options.name) {
      throw new Error('The options name is not defined!');
    }

    options.path = path = join(path, dasherize(options.name) + '-table');

    const hasComponentModule = host.exists(
      join(path, dasherize(options.name) + '-table.component.ts')
    );

    return chain([
      hasComponentModule
        ? noop()
        : externalSchematic('@rxap/schematics', 'component-module', {
          path: options.path.replace(/^\//, ''),
          project: projectName,
          name: dasherize(options.name) + '-table',
          theme: false,
          flat: true,
          stories: options.stories,
          skipTests: options.skipTests,
        }),
      mergeWith(
        apply(url('./files'), [
          applyTemplates({
            tableElement,
            ...strings,
            ...options,
          }),
          move(path),
          forEach((fileEntry) => {
            if (host.exists(fileEntry.path)) {
              if (options.overwrite) {
                host.overwrite(fileEntry.path, fileEntry.content);
              }

              return null;
            }

            return fileEntry;
          }),
        ]),
        MergeStrategy.Overwrite
      ),
      tableElement.hasFilter
        ? externalSchematic('@rxap/schematics-form', 'generate', {
          path: path.replace(/^\//, ''),
          formElement: tableElement.createFormElement(),
          component: false,
          project: projectName,
          flat: true,
          organizeImports: false,
          fixImports: false,
          format: false,
          templateBasePath: options.templateBasePath,
          overwrite: options.overwrite,
          skipTsFiles: options.skipTsFiles,
          tsMorphProject: () => project,
        })
        : noop(),
      tableElement.toValue({ project, options }),
      options.skipTsFiles
        ? noop()
        : ApplyTsMorphProject(project, options.path, options.organizeImports),
      options.fixImports ? FixMissingImports() : noop(),
      options.format ? formatFiles() : noop(),
      (tree, ctx) => {
        if (ctx.debug) {
          console.log(
            tree
              .read(
                join(
                  options.path!,
                  dasherize(options.name!) + '-table.component.module.ts'
                )
              )!
              .toString('utf-8')
          );
          console.log(
            tree
              .read(
                join(
                  options.path!,
                  dasherize(options.name!) + '-table.component.ts'
                )
              )!
              .toString('utf-8')
          );
          console.log(
            tree
              .read(
                join(
                  options.path!,
                  dasherize(options.name!) + '-table.component.html'
                )
              )!
              .toString('utf-8')
          );
        }
      },
    ]);
  };
}
