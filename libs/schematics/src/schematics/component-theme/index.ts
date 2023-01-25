import {
  apply,
  applyTemplates,
  chain,
  DirEntry,
  mergeWith,
  move,
  Rule,
  SchematicsException,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { GetProjectSourceRoot } from '@rxap/schematics-utilities';
import { createDefaultPath, getWorkspace } from '@schematics/angular/utility/workspace';
import { buildRelativePath } from '@schematics/angular/utility/find-module';
import { join } from 'path';
import { normalize, strings } from '@angular-devkit/core';
import { ComponentThemeSchema } from './schema';

const { dasherize } = strings;

function searchForIndexScss(dir: DirEntry, history: string[] = []): string | null {
  if (dir.subfiles.some(file => file === '_index.scss')) {
    return join(dir.path, '_index.scss');
  }
  history.push(dir.path);
  if (!dir.parent) {
    console.log(`Could not find _index.scss in ${history[0]} or parent directories`);
    return null;
  }
  return searchForIndexScss(dir.parent, history);
}

export function addThemeToProjectRoot(options: ComponentThemeSchema): Rule {
  return async (host: Tree) => {

    const projectSourceRoot = GetProjectSourceRoot(host, options.project);

    let indexScssFilePath = searchForIndexScss(host.getDir(options.path));

    if (indexScssFilePath === null) {
      console.log('create new _index.scss in project source root');
      indexScssFilePath = join(projectSourceRoot, '_index.scss');
      host.create(indexScssFilePath, `/* IMPORT */

@mixin feature-${options.project}-theme($theme) {

  /* THEME_INCLUDE */

}

@mixin feature-${options.project}-typography($config) {

  /* TYPOGRAPHY_INCLUDE */

}`);
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
