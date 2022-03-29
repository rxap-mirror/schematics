import { apply, applyTemplates, chain, mergeWith, move, Rule, Tree, url } from '@angular-devkit/schematics';
import { createDefaultPath, getWorkspace } from '@schematics/angular/utility/workspace';
import { buildRelativePath } from '@schematics/angular/utility/find-module';
import { join } from 'path';
import { normalize, strings } from '@angular-devkit/core';
import { ComponentThemeSchema } from './schema';

const { dasherize } = strings;

export function addThemeToProjectRoot(options: ComponentThemeSchema): Rule {
  return async (host: Tree) => {

    const workspace = await getWorkspace(host);
    const project   = workspace.projects.get(options.project);

    if (!project) {
      throw new Error('[ComponentTheme] Specified project does not exist.');
    }

    const root = project.sourceRoot ? `/${project.sourceRoot}/` : `/${project.root}/src/`;

    const indexScssFilePath = normalize(join(root, '_index.scss'));

    if (!host.exists(indexScssFilePath)) {
      host.create(indexScssFilePath, `/* IMPORT */

@mixin feature-${options.project}-theme($theme) {

  /* THEME_INCLUDE */

}

@mixin feature-${options.project}-typography($config) {

  /* TYPOGRAPHY_INCLUDE */

}`);
      throw new Error(`The index scss for the project '${options.project}' does not exists.`);
    }

    let indexScssFile = host.read(indexScssFilePath)!.toString();

    const componentThemeFilePath = normalize(join('/', options.path, `${dasherize(options.name)}.component.theme.scss`));

    if (!host.exists(componentThemeFilePath)) {
      throw new Error('Could not find component theme path');
    }

    const importPath = buildRelativePath(indexScssFilePath, componentThemeFilePath).replace(/\.scss$/, '');

    indexScssFile = indexScssFile
      .replace('/* IMPORT */', `/* IMPORT */\n@use "${importPath}" as ${dasherize(options.name)};`)
      .replace('/* THEME_INCLUDE */', `@include ${dasherize(options.name)}.theme($theme);\n  /* THEME_INCLUDE */`)
      .replace('/* TYPOGRAPHY_INCLUDE */', `@include ${dasherize(options.name)}.typography($config);\n  /* TYPOGRAPHY_INCLUDE */`);

    host.overwrite(indexScssFilePath, indexScssFile);

  };
}

export function renameThemeFile(options: ComponentThemeSchema): Rule {
  return (host: Tree) => {

    const componentThemeFilePath = normalize(join('/', options.path, `${dasherize(options.name)}.component.theme.scss`));

    if (!host.exists(componentThemeFilePath)) {
      throw new Error('Could not find component theme path');
    }

    host.rename(
      componentThemeFilePath,
      componentThemeFilePath.replace(`${dasherize(options.name)}.component.theme.scss`, `_${dasherize(options.name)}.component.theme.scss`)
    );

  };
}

export default function(options: ComponentThemeSchema): Rule {


  return async (host: Tree) => {

    const projectRootPath = await createDefaultPath(host, options.project as string);

    if (!options.path) {
      options.path = projectRootPath;
    } else if (options.path[ 0 ] === '/') {
      options.path = join(projectRootPath, options.path);
    }

    return chain([
      mergeWith(apply(url('./files'), [
        applyTemplates({
          ...strings,
          ...options
        }),
        move(options.path)
      ])),
      addThemeToProjectRoot(options),
      renameThemeFile(options)
    ]);

  };

}
