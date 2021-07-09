import { apply, chain, forEach, mergeWith, move, Rule, template, Tree, url, } from '@angular-devkit/schematics';
import { InitCustomMaterialThemeSchema } from './schema'
import { GetProjectSourceRoot } from '@rxap/schematics-utilities';
import { AddFeaturesIndexTheme } from './add-features-index-theme';

export default function (options: InitCustomMaterialThemeSchema): Rule {

  return async (host: Tree) => {

    const projectName = options.project;
    const projectSourceRoot = GetProjectSourceRoot(host, projectName);

    return chain([
      AddFeaturesIndexTheme(),
      mergeWith(apply(url('./files'), [
        template({}),
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
    ]);

  };

}
