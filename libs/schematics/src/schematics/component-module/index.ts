import { strings } from '@angular-devkit/core';
import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  Rule,
  schematic,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { addImportToModule, addRouteDeclarationToModule, insertImport } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { buildRelativePath, findModuleFromOptions } from '@schematics/angular/utility/find-module';
import { buildDefaultPath, getWorkspace } from '@schematics/angular/utility/workspace';
import { join } from 'path';
import { IndentationText, Project, QuoteKind } from 'ts-morph';
import * as ts from 'typescript';
import { ComponentModule } from '../schema';
import { addImportsToModule } from '../utilities';
import { AddComponentInput, ApplyTsMorphProject } from '@rxap/schematics-ts-morph';

const { dasherize, classify } = strings;

function buildRoute(options: ComponentModule) {
  return `{ path: '${options.route}', component: ${classify(options.name)}Component }`;
}

function addRouteToParentModule(options: ComponentModule, componentPath: string): Rule {
  return (host: Tree) => {

    if (!options.routing) {
      return host;
    }

    if (!options.route) {
      options.route = dasherize(options.name);
    }

    if (!options.module) {
      options.module = options.project;
    }

    const path = findModuleFromOptions(host, options);
    if (!path) {
      throw new Error(`Couldn't resolve routing module.`);
    }

    const text = host.read(path);
    if (!text) {
      throw new Error(`Couldn't find the target routing module.`);
    }

    const sourceText = text.toString();
    const addDeclaration             = addRouteDeclarationToModule(
      ts.createSourceFile(path, sourceText, ts.ScriptTarget.Latest, true) as any,
      path,
      buildRoute(options),
    ) as InsertChange;
    const componentImportDeclaration = insertImport(
      ts.createSourceFile(path, sourceText, ts.ScriptTarget.Latest, true) as any,
      path,
      `${classify(options.name)}Component`,
      buildRelativePath(path, componentPath),
    ) as InsertChange;

    const recorder = host.beginUpdate(path);
    recorder.insertLeft(addDeclaration.pos, addDeclaration.toAdd);
    recorder.insertLeft(componentImportDeclaration.pos, componentImportDeclaration.toAdd);
    host.commitUpdate(recorder);

    return host;

  };
}

function addImportToParentModule(options: ComponentModule, modulePath: string): Rule {
  return (host: Tree) => {

    if (!options.module) {
      return host;
    }

    const path = findModuleFromOptions(host, options);
    if (!path) {
      throw new Error(`Couldn't resolve routing module.`);
    }

    const text = host.read(path);
    if (!text) {
      throw new Error(`Couldn't find the target routing module.`);
    }

    const sourceText = text.toString();
    const moduleImport = addImportToModule(
      ts.createSourceFile(path, sourceText, ts.ScriptTarget.Latest, true) as any,
      path,
      `${classify(options.name)}ComponentModule`,
      buildRelativePath(path, modulePath),
    ) as InsertChange[];

    const recorder = host.beginUpdate(path);
    for (const insertChange of moduleImport) {
      recorder.insertLeft(insertChange.pos, insertChange.toAdd);
    }
    host.commitUpdate(recorder);

    return host;
  };
}

async function getProjectPrefix(host: Tree, projectName: string): Promise<string | undefined> {

  const workspace = await getWorkspace(host);
  const project   = workspace.projects.get(projectName);

  if (!project) {
    throw new Error('[ComponentModule] Specified project does not exist.');
  }

  return project.prefix;

}

function addModuleImportToComponentModule(options: ComponentModule, modulePath: string): Rule {

  return addImportsToModule(`${modulePath}.ts`, (options.import || []).map(importModule => {
    const split            = importModule.split(':');
    const importModuleName = split[ 0 ];
    const importModulePath = split[ 1 ];
    return { [ importModuleName ]: { path: importModulePath, module: importModuleName } };
  }).reduce((a, b) => ({ ...a, ...b }), {}));

}

function setInitialTemplate(options: ComponentModule, componentFilePath: string): Rule {
  return (host: Tree) => {
    if (options.template) {
      const fullComponentFilePath = componentFilePath + '.html';
      if (!host.exists(fullComponentFilePath)) {
        throw new Error('Could not find component template');
      }
      host.overwrite(fullComponentFilePath, options.template);
    }
  };
}

export default function(options: ComponentModule): Rule {

  return async (host: Tree) => {
    const workspace = await getWorkspace(host);
    const project   = workspace.projects.get(options.project as string);
    if (!project) {
      throw new Error('[ComponentModule] Specified project does not exist.');
    }

    const projectRootPath = buildDefaultPath(project);
    const isLibProject    = project.extensions[ 'projectType' ] === 'library';

    if (!options.path) {
      options.path = projectRootPath;
    } else if (options.path[ 0 ] === '/') {
      options.path = join(projectRootPath, options.path);
    }

    if (!options.prefix) {
      options.prefix = await getProjectPrefix(host, options.project as string) as any;
    }

    if (!options.selector) {
      options.selector = `${options.prefix}-${dasherize(options.name)}`;
    }

    const modulePath         = `${options.path}/${options.flat ? '' : `${dasherize(options.name)}/`}${dasherize(options.name)}.component.module`;
    const componentPath      = `${options.path}${options.flat ? '' : `/${dasherize(options.name)}`}`;
    const componentFilePath  = `${componentPath}/${dasherize(options.name)}.component`;
    const storyPath          = (options.flat ? options.path : join(options.path, dasherize(options.name))).replace(/^\//, '');
    const componentThemePath = (options.flat ? options.path : join(options.path, dasherize(options.name))).replace(/^\//, '');

    return chain([
      externalSchematic('@schematics/angular', 'module', {
        path: options.path,
        project: options.project,
        commonModule: options.commonModule,
        lintFix: options.lintFix,
        name: `${classify(options.name)}Component`,
        flat: true,
        routing: false,
        route: undefined,
        module: undefined,
        routingScope: undefined
      }),
      (tree: Tree) => {
        tree.rename(
          `${options.path}/${dasherize(options.name)}-component.module.ts`,
          `${modulePath}.ts`
        );
      },
      externalSchematic('@schematics/angular', 'component', {
        path: options.path,
        project: options.project,
        name: options.name,
        inlineStyle: options.inlineStyle,
        inlineTemplate: options.inlineTemplate,
        viewEncapsulation: options.viewEncapsulation,
        changeDetection: options.changeDetection,
        prefix: options.prefix,
        style: options.style,
        type: options.type,
        skipTests: options.skipTests,
        flat: options.flat,
        skipSelector: options.skipSelector,
        skipImport: false,
        module: `${dasherize(options.name)}.component.module`,
        export: true,
        selector: undefined,
      }),
      options.stories ? schematic('component-stories', {
        project: options.project,
        path:    storyPath,
        name:    options.name,
        prefix:  options.prefix,
      }) : noop(),
      addRouteToParentModule(options, `/${componentFilePath}`),
      addImportToParentModule(options, `/${modulePath}`),
      options.theme ? schematic('component-theme', {
        project: options.project,
        name: options.name,
        path: componentThemePath,
        prefix: options.prefix,
      }) : noop(),
      mergeWith(apply(url('./files'), [
        applyTemplates({
          ...strings,
          ...options
        }),
        move(componentPath)
      ]), MergeStrategy.Overwrite),
      tree => {

        const project = new Project({
          manipulationSettings: { indentationText: IndentationText.TwoSpaces },
          useInMemoryFileSystem: true
        });

        const componentFile = componentFilePath + '.ts';

        const sourceFile = project.createSourceFile(componentFile, tree.read(componentFile)?.toString());

        for (const input of options.input ?? []) {

          AddComponentInput(
            sourceFile,
            {
              name: input.name,
              type: input.type,
              required: input.required,
              initializer: input.initializer,
              docs: input.docs ? [ input.docs ] : [],
              setAccessor: input.setAccessor,
            },
            (input.imports ?? []).map(imp => ({
              namedImports: [ imp.namedImport ],
              moduleSpecifier: imp.moduleSpecifier
            })),
          );

        }

        return ApplyTsMorphProject(project);

      },
      ...(options.output || []).map(input => {
        const componentSplit = input.split('#');
        const propertySplit = componentSplit[0].split(';');
        const split = propertySplit[0].split(':');
        const description = componentSplit[1];
        const property = split[0];
        const type = split[1];
        const typeImport = propertySplit[1];
        return schematic('component-output', {
          project: options.project,
          component: options.name,
          path: componentPath.replace(/^\//, ''),
          property,
          type,
          typeImport,
          description
        });
      }),
      ...(options.inputOutput || []).map(input => {
        const componentSplit = input.split('#');
        const propertySplit  = componentSplit[ 0 ].split(';');
        const split          = propertySplit[ 0 ].split(':');
        const description    = componentSplit[ 1 ];
        const property       = split[ 0 ];
        const type           = split[ 1 ];
        const initial        = split[ 2 ];
        const typeImport     = propertySplit[ 1 ];
        return schematic('component-input-output', {
          project:   options.project,
          component: options.name,
          path:      componentPath.replace(/^\//, ''),
          property,
          type,
          typeImport,
          description,
          initial
        });
      }),
      ...(options.hostBinding || []).map(hostBinding => {
        const propertySplit    = hostBinding.split(';');
        const split            = propertySplit[ 0 ].split(':');
        const property         = split[ 0 ];
        const type             = split[ 1 ];
        const initial          = split[ 2 ];
        const hostPropertyName = split[ 3 ];
        const typeImport       = propertySplit[ 1 ];
        return schematic('component-host-binding', {
          project:   options.project,
          component: options.name,
          path:      componentPath.replace(/^\//, ''),
          property,
          type,
          typeImport,
          initial,
          hostPropertyName
        });
      }),
      ...(options.hostListener || []).map(hostListener => {
        const componentSplit = hostListener.split('#');
        const split          = componentSplit[ 0 ].split(':');
        const description    = componentSplit[ 1 ];
        const property       = split[ 0 ];
        const eventName      = split[ 1 ];
        return schematic('component-host-listener', {
          project:   options.project,
          component: options.name,
          path:      componentPath.replace(/^\//, ''),
          property,
          eventName,
          description
        });
      }),
      addModuleImportToComponentModule(options, modulePath),
      setInitialTemplate(options, componentFilePath),
      options.debug ?
      (tree: Tree) => console.log('-----------\n', componentFilePath + '.ts', ':\n\n', tree.read(componentFilePath + '.ts')!.toString(), '\n-----------') :
      noop(),
      options.debug ?
      (tree: Tree) => console.log('-----------\n', modulePath + '.ts', ':\n\n', tree.read(modulePath + '.ts')!.toString(), '\n-----------') :
      noop(),
      options.debug ?
      (tree: Tree) => console.log('-----------\n', componentFilePath + '.html', ':\n\n', tree.read(componentFilePath + '.html')!.toString(), '\n-----------') :
      noop(),
      options.debug ?
      (tree: Tree) => console.log(
        '-----------\n',
        componentFilePath + '.ts',
        ':\n\n',
        tree.read(componentFilePath + '.stories.ts')!.toString(),
        '\n-----------',
      ) :
      noop(),
      isLibProject ? () => {

        // TODO : add auto export for new component-module

      } : noop(),
      options.astTransformer ? tree => {

        const project = new Project({
          manipulationSettings: {
            indentationText: IndentationText.TwoSpaces,
            quoteKind:       QuoteKind.Single,
          },
        });

        const fullComponentFilePath = componentFilePath + '.ts';

        const sourceFile = project.createSourceFile(
          fullComponentFilePath,
          tree.read(fullComponentFilePath)!.toString('utf-8'),
        );

        const astTransformer = options.astTransformer!;

        astTransformer(sourceFile, options);

        tree.overwrite(fullComponentFilePath, sourceFile.getFullText());

      } : noop(),
    ]);

  };
}
