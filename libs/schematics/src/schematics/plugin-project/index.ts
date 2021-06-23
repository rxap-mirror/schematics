import { chain, Rule, schematic, SchematicsException, } from '@angular-devkit/schematics';
import { PluginProjectSchema } from './schema'
import { strings } from '@angular-devkit/core';
import {
  DeleteRecursive,
  GetProjectBuildersJson,
  GetProjectCollectionJson,
  GuessBuilderRoot,
  GuessSchematicRoot
} from '@rxap/schematics-utilities';
import { join } from 'path';

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
        overwrite: options.overwrite,
      }),
      tree => {
        const collectionJson = GetProjectCollectionJson(tree, projectName);
        const schematicRoot = GuessSchematicRoot(tree, projectName);
        const rules: Rule[] = [];
        if (!collectionJson.schematics['ng-add'] || options.overwrite) {
          rules.push(schematic('config-plugin-ng-add', {
            project: projectName
          }));
          if (collectionJson.schematics['ng-add']) {
            DeleteRecursive(tree, tree.getDir(join(schematicRoot, 'ng-add')));
          }
        }
        if (!collectionJson.schematics['config'] || options.overwrite) {
          if (options.defaultTarget && options.defaultBuilder) {
            rules.push(schematic('add-plugin-config-schematic', {
              name: 'config',
              project: projectName,
              defaultBuilder: options.defaultBuilder,
              defaultTarget: options.defaultTarget,
            }))
            if (options.overwrite) {
              DeleteRecursive(tree, tree.getDir(join(schematicRoot, 'config')));
            }
          } else {
            console.warn('Skip add plugin config schematic. Option defaultTarget or/and defaultBuilder are not defined.');
          }
        }
        if (options.defaultBuilder) {
          const builderJson = GetProjectBuildersJson(tree, projectName);
          if (!builderJson.builders[options.defaultBuilder] || options.overwrite) {
            if (options.defaultBuilderDescription) {
              rules.push(schematic('add-builder', {
                project: projectName,
                name: options.defaultBuilder,
                description: options.defaultBuilderDescription,
              }))
              if (options.overwrite) {
                const buildersRoot = GuessBuilderRoot(tree, projectName);
                DeleteRecursive(tree, tree.getDir(join(buildersRoot, 'options.defaultBuilder')));
              }
            } else {
              console.warn('Skip add builder schematic. Option defaultBuilderDescription is not defined.');
            }
          }
        } else {
          console.warn('Skip add builder schematic. Option defaultBuilder is not defined.');
        }
        return chain(rules);
      },
    ]);

  };

}
