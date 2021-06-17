import { chain, Rule, schematic, Tree } from '@angular-devkit/schematics';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { join } from 'path';
import { ComponentInputOutputSchema } from './schema';

export default function(options: ComponentInputOutputSchema): Rule {

  return async (host: Tree) => {

    const projectRootPath = await createDefaultPath(host, options.project as string);

    if (!options.path) {
      options.path = projectRootPath;
    } else if (options.path[ 0 ] === '/') {
      options.path = join(projectRootPath, options.path);
    }

    return chain([
      schematic('component-input', options),
      schematic('component-output', {
        ...options,
        property: `${options.property}Change`
      })
    ]);

  };

}
