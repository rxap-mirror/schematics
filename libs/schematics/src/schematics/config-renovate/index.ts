import { apply, chain, forEach, mergeWith, Rule, template, Tree, url, } from '@angular-devkit/schematics';
import { ConfigRenovateSchema } from './schema'

export default function (options: ConfigRenovateSchema): Rule {

  return async (host: Tree) => {

    return chain([
      mergeWith(apply(url('./files'), [
        template({}),
        forEach(entry => {
          if (host.exists(entry.path)) {
            if (options.overwrite) {
              host.overwrite(entry.path, entry.content);
            }
            return null;
          }
          return entry;
        })
      ]))
    ]);

  };

}
