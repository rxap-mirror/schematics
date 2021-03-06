import { strings } from '@angular-devkit/core';
import { chain, noop, Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { formatFiles } from '@nrwl/workspace';
import { AddDir, ApplyTsMorphProject, FixMissingImports, MergeTsMorphProject } from '@rxap/schematics-ts-morph';
import { GetAngularJson } from '@rxap/schematics-utilities';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { join } from 'path';
import { IndentationText, Project, QuoteKind } from 'ts-morph';
import { FormElement } from './elements/form.element';
import { ParseFormElement } from './parse-form-element';
import { GenerateSchema } from './schema';

const { dasherize, classify, camelize } = strings;

export default function (options: GenerateSchema): Rule {
  return async (host: Tree) => {
    const projectRootPath = options.project
                            ? await createDefaultPath(host, options.project as string)
                            : '/';

    if (!options.path) {
      options.path = projectRootPath;
    } else if (options.path[0] === '/') {
      options.path = join(projectRootPath, options.path);
    }

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

    let formElement: FormElement | undefined = options.formElement;

    if (!formElement) {
      formElement = ParseFormElement(host, options.template, options.templateBasePath);
    }

    const project = new Project({
      useInMemoryFileSystem: true,
      manipulationSettings: {
        quoteKind: QuoteKind.Single,
        indentationText: IndentationText.TwoSpaces,
      },
    });

    formElement.id = options.name ? dasherize(options.name) : formElement.id;

    const formFilePath = dasherize(formElement.id) + '.form.ts';

    let pathSuffix = '';

    if (!options.flat) {
      pathSuffix = dasherize(formElement.id) + '-form'
    }
    options.path = join(options.path!, pathSuffix);

    AddDir(
      host.getDir(options.path),
      project,
      undefined,
      (pathFragment) => !!pathFragment.match(/\.ts$/)
    );

    const formSourceFile =
      project.getSourceFile(formFilePath) ??
      project.createSourceFile(formFilePath);

    // TODO : use the common concept for toValue and return a rule
    formElement.toValue({ sourceFile: formSourceFile, project, options });

    return chain([
      // if the parent schematic has a ts-morph project apply the changes to this project
      options.tsMorphProject ? () => MergeTsMorphProject(options.tsMorphProject!(), project, pathSuffix) : noop(),
      // only apply files to the ts-morph project if not already exists
      // else the changes made by previous steps are overwritten
      options.skipTsFiles || options.tsMorphProject
        ? noop()
        : ApplyTsMorphProject(project, options.path, options.organizeImports),
      options.fixImports ? FixMissingImports() : noop(),
      options.format ? formatFiles() : noop(),
    ]);
  };
}
