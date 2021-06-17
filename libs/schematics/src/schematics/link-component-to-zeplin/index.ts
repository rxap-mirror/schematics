import { chain, Rule, Tree } from '@angular-devkit/schematics';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { join } from 'path';
import { LinkComponentToZeplinSchema } from './schema';
import { findComponentFromOptions } from './find-component-from-options';
import { normalize } from '@angular-devkit/core';

function addComponentToConfig(options: LinkComponentToZeplinSchema): Rule {
  return (host: Tree) => {

    let path = findComponentFromOptions(host, options);

    if (!path) {
      throw new Error(`Could not find component '${options.name}'.`);
    }

    path = normalize(path.substring(1, path.length));

    const componentsJsonPath = '.zeplin/components.json';

    if (!host.exists(componentsJsonPath)) {
      throw new Error('Could not find zeplin configuration.');
    }

    const componentsJson: { components: Array<{ path: string, zeplinNames: string[] }> } = JSON.parse(host.read(componentsJsonPath)!.toString());

    const existingDefinitionIndex = componentsJson.components.findIndex(component => component.path === path);

    if (existingDefinitionIndex !== -1) {
      console.warn(`The component '${options.name}' is already added to the zeplin configuration`);
    } else {
      componentsJson.components.push({
        path,
        zeplinNames: options.zeplinName
      });
    }

    host.overwrite(componentsJsonPath, JSON.stringify(componentsJson, null, 2));

  };
}

export default function(options: LinkComponentToZeplinSchema): Rule {

  return async (host: Tree) => {

    const projectRootPath = await createDefaultPath(host, options.project as string);

    if (!options.path) {
      options.path = projectRootPath;
    } else if (options.path[ 0 ] === '/') {
      options.path = join(projectRootPath, options.path);
    }

    return chain([ addComponentToConfig(options) ]);

  };

}
