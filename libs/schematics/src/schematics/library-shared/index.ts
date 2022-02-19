import { chain, externalSchematic, noop, Rule, schematic, Tree } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { LibrarySharedSchema } from './schema';

function removeSharedModule(): Rule {
  return (host: Tree) => {
    host.overwrite('libs/shared/src/index.ts', '');
    host.delete('libs/shared/src/lib/shared.module.ts');
    if (host.exists('libs/shared/src/lib/shared.module.spec.ts')) {
      host.delete('libs/shared/src/lib/shared.module.spec.ts');
    }
    return host;
  };
}

export default function (options: LibrarySharedSchema): Rule {

  return async (host: Tree) => {

    const workspace = await getWorkspace(host);

    if (!workspace) {
      throw new Error('Could not load workspace.');
    }

    const hasSharedModule = workspace.projects.has('shared');

    if (hasSharedModule) {

      console.log('Library shared already exists');

      return chain([]);

    } else {

      return chain([
        externalSchematic(
          '@nrwl/angular',
          'library',
          {
            name:      'shared',
            style: 'scss'
          }
        ),
        options.storybook ? schematic(
          'library-storybook-configuration',
          {
            name:                 'shared',
            configureCypress:     true,
            generateStories:      false,
            generateCypressSpecs: false,
          },
        ) : noop(),
        schematic(
          'library-theme',
          {
            project: 'shared',
          },
        ),
        removeSharedModule(),
      ]);

    }

  };

}
