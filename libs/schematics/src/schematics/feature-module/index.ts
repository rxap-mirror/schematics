import {
  apply,
  chain,
  externalSchematic,
  forEach,
  mergeWith,
  noop,
  Rule,
  schematic,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { FeatureModuleSchema } from './schema';

const { dasherize } = strings;

export default function(options: FeatureModuleSchema): Rule {

  return async (host: Tree) => {

    return chain([
      mergeWith(apply(url('./files'), [
        template({}),
        forEach(entry => {
          if (host.exists(entry.path)) {
            return null;
          }
          return entry;
        }),
      ])),
      externalSchematic(
        '@nrwl/angular',
        'library',
        {
          directory: 'feature',
          lazy:      false,
          routing:   true,
          style:     'scss',
          name:      options.name,
          tags:      'feature'
        }
      ),
      options.storybook ? schematic(
        'library-storybook-configuration',
        {
          name:                 `feature-${dasherize(options.name)}`,
          configureCypress:     false,
          generateStories:      false,
          generateCypressSpecs: false,
        },
      ) : noop(),
      schematic(
        'library-theme',
        {
          project: [ 'feature', dasherize(options.name) ].join('-'),
        },
      ),
    ]);

  };

}
