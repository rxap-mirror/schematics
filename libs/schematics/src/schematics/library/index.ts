import { strings } from '@angular-devkit/core';
import { chain, externalSchematic, noop, Rule, schematic, Tree } from '@angular-devkit/schematics';
import { join } from 'path';
import { LibrarySchema } from './schema';

const { dasherize } = strings;

export default function (options: LibrarySchema): Rule {

  return () => {

    let projectBasePath = join('libs', dasherize(options.name));
    if (options.directory) {
      projectBasePath = join('libs', options.directory, dasherize(options.name));
    }

    const fullProjectName = [ options.directory, options.name ].filter(Boolean).join('-')

    return chain([
      externalSchematic('@nrwl/angular', 'library', {
        name: options.name,
        addModuleSpec: false,
        publishable: true,
        style: 'scss',
        directory: options.directory,
        importPath: options.importPath
      }),
      (tree: Tree) => {
        const moduleFilePath = join(projectBasePath, 'src', 'lib', `${dasherize(options.name)}.module.ts`);
        if (tree.exists(moduleFilePath)) {
          tree.delete(moduleFilePath);
        }
        const indexFilePath = join(projectBasePath, 'src', 'index.ts');
        if (tree.exists(indexFilePath)) {
          tree.overwrite(indexFilePath, 'export {}');
        }
        tree.create(join(projectBasePath, 'CHANGELOG'), '# Changelog');
      },
      options.theming ? schematic('library-theme', {
        project: fullProjectName,
        bundle: true,
      }) : noop(),
      externalSchematic('@rxap/plugin-pack', 'config', {
        project: fullProjectName,
      }),
      externalSchematic('@rxap/plugin-library-schematics', 'config', {
        project: fullProjectName,
      }),
      externalSchematic('@rxap/plugin-library-publish', 'config', {
        project: fullProjectName,
      }),
    ]);

  };

}
