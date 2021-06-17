import { chain, noop, Rule, Tree } from '@angular-devkit/schematics';
import { ZeplinConfigurationSchema } from './schema';
import { addPackageJsonDependencies, addPackageJsonScripts } from '../utilities';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';

const baseComponentJson = {
  plugins:     [],
  projects:    [],
  styleguides: [],
  components:  []
};

const ZEPLIN_COMPONENTS_JSON_PATH = '.zeplin/components.json';

function addZeplinComponentsJson(options: ZeplinConfigurationSchema): Rule {
  return (tree: Tree) => {

    if (!tree.exists(ZEPLIN_COMPONENTS_JSON_PATH)) {
      tree.create(ZEPLIN_COMPONENTS_JSON_PATH, JSON.stringify(baseComponentJson, null, 2));
    }

    const componentJsonFile = tree.read(ZEPLIN_COMPONENTS_JSON_PATH)!.toString('utf-8');
    const componentJson     = JSON.parse(componentJsonFile);

    componentJson.projects    = [ ...componentJson.projects, ...options.project ].filter((project, index, self) => self.indexOf(project) === index);
    componentJson.styleguides = [ ...componentJson.styleguides, ...options.styleguide ].filter((styleguide, index, self) => self.indexOf(styleguide) === index);

    if (options.url) {

      const storybookConnectPlugin = componentJson.plugins.find((plugin: any) => plugin.name === '@zeplin/cli-connect-storybook-plugin');

      if (storybookConnectPlugin) {
        storybookConnectPlugin.config.url = options.url;
      } else {
        componentJson.plugins.push({
          name:   '@zeplin/cli-connect-storybook-plugin',
          config: {
            url: options.url
          }
        });
      }

      if (!componentJson.plugins.some((plugin: any) => plugin.name === '@zeplin/cli-connect-angular-plugin')) {
        componentJson.plugins.push({
          name:   '@zeplin/cli-connect-angular-plugin',
          config: {
            useFullSnippet:     true,
            useFullDescription: true
          }
        });
      }

    }

    tree.overwrite(ZEPLIN_COMPONENTS_JSON_PATH, JSON.stringify(componentJson, null, 2));

  };
}

export default function(options: ZeplinConfigurationSchema): Rule {

  return async () => {

    return chain([
      addZeplinComponentsJson(options),
      addPackageJsonDependencies(
        NodeDependencyType.Dev,
        '!@zeplin/cli@1.0'
      ),
      options.url ? addPackageJsonDependencies(
        NodeDependencyType.Dev,
        '!@zeplin/cli-connect-angular-plugin@0.1',
        '!@zeplin/cli-connect-storybook-plugin@0.2'
      ) : noop(),
      options.url ? addPackageJsonScripts({
        "zeplin:connect": "zeplin connect",
      }) : noop()
    ]);

  };

}
