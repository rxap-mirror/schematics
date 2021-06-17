import { chain, externalSchematic, noop, Rule, schematic, Tree } from '@angular-devkit/schematics';
import { SharedModuleSchema } from './schema';
import { normalize, strings } from '@angular-devkit/core';

const { classify, dasherize } = strings;

export function addExportToIndex(options: SharedModuleSchema): Rule {
  return (host: Tree) => {

    const indexPath = normalize('libs/shared/src/index.ts');

    if (!host.exists(indexPath)) {
      throw new Error('The shared module index file is not created!');
    }

    let indexFile = host.read(indexPath)!.toString();

    let exportStr = '';

    if (options.component) {

      exportStr += `
// region ${classify(options.name)}Component
export * from './lib/${dasherize(options.name)}/${dasherize(options.name)}.component.module';
export * from './lib/${dasherize(options.name)}/${dasherize(options.name)}.component';`;

    } else {

      exportStr += `
// region ${classify(options.name)}Module
export * from './lib/${dasherize(options.name)}/${dasherize(options.name)}.module';`;

    }

    exportStr += `
// endregion
`;

    indexFile += exportStr;

    host.overwrite(indexPath, indexFile);

    return host;
  };
}

export default function(options: SharedModuleSchema): Rule {

  if ([ options.inputOutput, options.input, options.output ].some(a => a.length)) {
    options.component = true;
  }

  if (options.component && !options.name) {
    throw new Error('If a shared component should be generated the component name must be set!');
  }

  return async () => {

    return chain([
      schematic('library-shared', {}),
      options.component ?
      schematic(
        'component-module',
        {
          project:      'shared',
          name:         options.name,
          selector:     options.selector,
          input:        options.input,
          output:       options.output,
          inputOutput:  options.inputOutput,
          import:       options.import,
          template:     options.template,
          hostListener: options.hostListener,
          hostBinding:  options.hostBinding,
          stories:      options.storybook,
        },
      ) :
      externalSchematic(
        '@schematics/angular',
        'module',
        {
          project: 'shared',
          name:    options.name
        }
      ),
      addExportToIndex(options),
      options.zeplinName && options.zeplinName.length ? schematic(
        'link-component-to-zeplin',
        {
          project:    'shared',
          name:       options.name,
          zeplinName: options.zeplinName,
        },
      ) : noop(),
    ]);

  };

}
