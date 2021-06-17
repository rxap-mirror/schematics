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
  url
} from '@angular-devkit/schematics';
import { addPackageJsonDependencies } from '../utilities';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import { storybookVersion } from '@nrwl/storybook/src/utils/versions';

export default function(): Rule {

  return async (host: Tree) => {

    return chain([
      externalSchematic('@nrwl/storybook', 'init', {
        uiFramework: '@storybook/angular',
      }),
      mergeWith(apply(url('./files'), [
        template({}),
        forEach(entry => {
          if (host.exists(entry.path)) {
            host.overwrite(entry.path, entry.content);
          }
          return entry;
        }),
      ]), MergeStrategy.Overwrite),
      addPackageJsonDependencies(
        NodeDependencyType.Dev,
        `!@storybook/addon-a11y@${storybookVersion}`,
        `!@storybook/addon-actions@${storybookVersion}`,
        `!@storybook/addon-docs@${storybookVersion}`,
        `!@storybook/addon-knobs@${storybookVersion}`,
        `!@storybook/angular@${storybookVersion}`,
        `!@storybook/addon-viewport@${storybookVersion}`,
        `!@storybook/addon-backgrounds@${storybookVersion}`,
        '!@compodoc/compodoc@1.1',
      ),
    ]);

  };

}
