import { strings } from '@angular-devkit/core';
import { chain, externalSchematic, noop, Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { formatFiles } from '@nrwl/workspace';
import { ApplyTsMorphProject, FixMissingImports, MergeTsMorphProject } from '@rxap/schematics-ts-morph';
import { GetAngularJson, GetProjectRoot, GuessProjectName } from '@rxap/schematics-utilities';
import { ParseTemplate } from '@rxap/schematics-xml-parser';
import { join } from 'path';
import { IndentationText, Project, QuoteKind } from 'ts-morph';
import { Elements } from './elements/elements';
import { FormElement } from './elements/form.element';
import { GenerateSchema } from './schema';

const { dasherize, classify, camelize, capitalize } = strings;

export default function (options: GenerateSchema): Rule {
  return async (host: Tree, context) => {
    const projectName     = options.project = GuessProjectName(host, options);
    const projectRootPath = GetProjectRoot(host, projectName);

    let path: string = options.path ?? '';

    if (!options.path) {
      // TODO : check if lib or app should be used
      path = projectRootPath + '/src/lib';
    } else if (options.path[0] === '/') {
      path = join(projectRootPath + '/src/lib', options.path);
    }

    const basePathList: string[] = [];

    if (options.templateBasePath) {
      basePathList.push(options.templateBasePath);
    }
    if (options.path) {
      // Hack to go out of the templates base folder
      basePathList.push(join('..', options.path));
    }

    const formElement = ParseTemplate<FormElement>(
      host,
      options.template,
      basePathList,
      ...Elements
    );
    options.name = options.name ?? formElement.name;

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

    if (!options.name) {
      throw new Error('FATAL: the options name is not defined');
    }

    const pathSuffix = dasherize(options.name) + '-form'
    options.path = path = join(path, pathSuffix);

    console.log('@rxap/material-form-system base path: ', path);

    const componentTemplateFilePath = join(
      path,
      dasherize(options.name) + '-form.component.html'
    );
    const componentModuleFilePath = join(
      path,
      dasherize(options.name) + '-form.component.module.ts'
    );
    const componentFilePath = join(
      path,
      dasherize(options.name) + '-form.component.ts'
    );

    const hasComponentTemplate = host.exists(componentTemplateFilePath);

    return chain([
      hasComponentTemplate
      ? noop()
      : externalSchematic('@rxap/schematics', 'component-module', {
        path:    options.path.replace(/^\//, ''),
        project: projectName,
        name:    dasherize(options.name) + '-form',
        flat:    true,
        theme:   false,
      }),
      formElement.toValue({ host, project, options }),
      // if the parent schematic has a ts-morph project apply the changes to this project
      options.tsMorphProject ? () => MergeTsMorphProject(options.tsMorphProject!(), project, pathSuffix) : noop(),
      // only apply files to the ts-morph project if not already exists
      // else the changes made by previous steps are overwritten
      options.skipTsFiles || options.tsMorphProject
      ? noop()
      : ApplyTsMorphProject(project, options.path, options.organizeImports),
      options.fixImports ? FixMissingImports() : noop(),
      options.format ? formatFiles() : noop(),
      context.debug
        ? (tree) => {
          console.log('\n==========================================');
          console.log('path: ' + componentFilePath);
          console.log('==========================================');
          console.log(tree.read(componentFilePath)!.toString('utf-8'));
            console.log('\n==========================================');
            console.log('path: ' + componentModuleFilePath);
            console.log('==========================================');
            console.log(tree.read(componentModuleFilePath)!.toString('utf-8'));
            console.log('\n==========================================');
            console.log('path: ' + componentTemplateFilePath);
            console.log('==========================================');
            console.log(
              tree.read(componentTemplateFilePath)!.toString('utf-8')
            );
            console.log('==========================================\n');
          }
        : noop(),
    ]);
  };
}
