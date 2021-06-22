import { chain, noop, Rule, schematic, SchematicsException, } from '@angular-devkit/schematics';
import { PluginProjectSchema } from './schema'
import { strings } from '@angular-devkit/core';

export default function (options: PluginProjectSchema): Rule {

  if (!options.project) {
    if (!options.name) {
      throw new SchematicsException('The option name is required!');
    }
    if (!options.importPath) {
      throw new SchematicsException('The option importPath is required!');
    }
  }

  return async () => {
    const projectName = options.project ?? strings.dasherize([ options.directory, options.name ].filter(Boolean).join('-'));
    return chain([
      schematic('schematic-project', {
        project: options.project,
        builders: true,
      }),
      options.defaultTarget && options.defaultBuilder ? schematic('add-plugin-config-schematic', {
        project: projectName,
        defaultBuilder: options.defaultBuilder,
        defaultTarget: options.defaultTarget,
      }) : noop(),
      schematic('add-builder', {
        project: projectName,
        name: options.defaultBuilder,
      }),
      schematic('config-plugin-ng-add', {
        project: projectName
      }),
    ]);

  };

}
