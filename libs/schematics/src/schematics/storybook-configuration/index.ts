import {
  apply,
  chain,
  externalSchematic,
  forEach,
  MergeStrategy,
  mergeWith,
  Rule,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { addPackageJsonDependencies } from '../utilities';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import { StorybookConfigurationSchema } from './schema';
import { storybookVersion } from '@nx/storybook';

export default function (options: StorybookConfigurationSchema): Rule {
  return async (host: Tree) => {
    return chain([
      externalSchematic('@nx/storybook', 'configuration', {
        uiFramework: '@storybook/angular',
        name: options.project,
        configureCypress: false,
      }),
      externalSchematic('@nrwl/angular', 'library', {
        name: 'storybook',
      }),
      externalSchematic('@nx/storybook', 'configuration', {
        uiFramework: '@storybook/angular',
        name: 'storybook',
        configureCypress: true,
      }),
      mergeWith(
        apply(url('./files'), [
          template({}),
          forEach((entry) => {
            if (host.exists(entry.path)) {
              host.overwrite(entry.path, entry.content);
            }
            return entry;
          }),
        ]),
        MergeStrategy.Overwrite
      ),
      // TODO : install @currents/nx and add currents target to the storybook-e2e project
      // TODO : change the devServerTarget for storybook-e2e to pwa:storybook
      // TODO : add configuration watch to the e2e target in the storybook-e2e project
      // TODO : add configuration storybook to the build target in the pwa project with optimization =
      /**
       * {
       *   "fonts": true,
       *   "scripts": true,
       *   "styles": {
       *     "minify": true,
       *     "inlineCritical": true
       *   }
       * }
       */
      // TODO : set storybook and build-storybook target option projectBuildConfig = pwa:build:storybook
      addPackageJsonDependencies(
        NodeDependencyType.Dev,
        `!@storybook/addon-measure@${storybookVersion}`,
        `!@storybook/addon-essentials@${storybookVersion}`,
        `!@storybook/addon-outline@${storybookVersion}`,
        `!@storybook/addon-controls@${storybookVersion}`,
        `!@storybook/angular@${storybookVersion}`,
        `!@storybook/addon-viewport@${storybookVersion}`,
        `!@storybook/addon-backgrounds@${storybookVersion}`,
        '!storybook-addon-angular-router@1.5.0',
        '!storybook-dark-mode@1.0.9'
      ),
    ]);
  };
}
