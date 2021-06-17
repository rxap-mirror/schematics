import { apply, chain, forEach, mergeWith, move, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { join } from 'path';
import { FileEntry } from '@angular-devkit/schematics/src/tree/interface';

export interface IdeaRunConfig {
  name: string;
  basePath?: string;
}

export default function(options: IdeaRunConfig): Rule {
  return async (host: Tree) => {

    const packageJsonPath = join(...[ '$PROJECT_DIR$', options.basePath ?? '', 'libs', strings.dasherize(options.name), 'package.json' ].filter(i => !!i));

    return chain([
      mergeWith(
        apply(url('./files'), [
          template({
            ...strings,
            ...options,
            packageJsonPath
          }),
          move(join('.idea/runConfigurations')),
          forEach((fileEntry: FileEntry) => {
            if (host.exists(fileEntry.path)) {
              host.overwrite(fileEntry.path, fileEntry.content);
            }
            return fileEntry;
          }),
        ]),
      )
    ]);

  };
}
