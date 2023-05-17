import {
  chain,
  noop,
  Rule,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { formatFiles } from '@nx/workspace';
import { strings } from '@angular-devkit/core';
import { RoutingSchema } from './schema';
import { HandelTemplate } from './elements/utils';
import { Elements } from './elements/elements';
import { FixMissingImports, OrganizeImports } from '@rxap/schematics-ts-morph';
import { join } from 'path';
import {
  GetAngularJson,
  GetProjectPrefix,
  GetProjectSourceRoot,
} from '@rxap/schematics-utilities';

const { dasherize, classify, camelize, capitalize } = strings;

export default function (options: RoutingSchema): Rule {
  return async (host: Tree) => {
    if (!options.prefix) {
      options.prefix = GetProjectPrefix(host, options.project);
    }

    const extendedElements = Elements;

    if (!options.openApiModule) {
      const angularJson = GetAngularJson(host);
      if (!angularJson.projects) {
        angularJson.projects = {};
      }
      if (Object.keys(angularJson.projects).includes('open-api')) {
        options.openApiModule = `@${angularJson.projects['open-api'].prefix}/open-api`;
      } else {
        if (angularJson.defaultProject) {
          options.openApiModule = `@${
            angularJson.projects[angularJson.defaultProject].prefix
          }/open-api`;
        } else {
          throw new SchematicsException('The default project is not defined');
        }
      }
    }

    if (options.project && !options.path) {
      options.path = join(GetProjectSourceRoot(host, options.project), 'app');
    }

    console.log(
      'Extended Elements: ',
      extendedElements.map((ctor) => ctor.name).join(', ')
    );

    if (options.skipTsFiles) {
      options.organizeImports = false;
      options.fixImports = false;
    }

    return chain([
      HandelTemplate(options),
      options.organizeImports ? OrganizeImports() : noop(),
      options.fixImports ? FixMissingImports() : noop(),
      options.format ? formatFiles() : noop(),
    ]);
  };
}
