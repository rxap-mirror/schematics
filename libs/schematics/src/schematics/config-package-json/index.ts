import { Rule, Tree, } from '@angular-devkit/schematics';
import { ConfigPackageJsonSchema } from './schema'
import {
  GetPackageJson,
  GetProjectRoot,
  GetRelativePathToProjectRoot,
  UpdateProjectPackageJson
} from '@rxap/schematics-utilities';
import { unique } from '@rxap/schematics-utilities';
import { join } from 'path';

export default function (options: ConfigPackageJsonSchema): Rule {

  return async (host: Tree) => {

    const rootPackageJson = GetPackageJson(host);
    const projectRoot = GetProjectRoot(host, options.project);

    return UpdateProjectPackageJson(packageJson => {

      packageJson.private = false;
      if (rootPackageJson.author) {
        packageJson.author = rootPackageJson.author;
      } else {
        console.warn('Can not update the author property. The root package.json does not have the author property.');
      }
      if (rootPackageJson.homepage) {
        packageJson.homepage = rootPackageJson.homepage + '/-/blob/master/' + projectRoot;
      } else {
        console.warn('Can not update the homepage property. The root package.json does not have the homepage property.');
      }
      if (rootPackageJson.repository) {
        packageJson.repository = rootPackageJson.repository;
      } else {
        console.warn('Can not update the repository property. The root package.json does not have the repository property.');
      }

      if (!packageJson.keywords) {
        packageJson.keywords = [];
      }
      packageJson.keywords.push(...(rootPackageJson.keywords ?? []));
      packageJson.keywords = packageJson.keywords.filter(unique());

      if (!packageJson.license) {
        packageJson.license = rootPackageJson.license;
      }

      if (rootPackageJson.bugs) {
        packageJson.bugs = rootPackageJson.bugs;
      } else {
        console.warn('Can not update the bugs property. The root package.json does not have the bugs property.');
      }
      packageJson.publishConfig = {
        directory: join(GetRelativePathToProjectRoot(host, options.project), 'dist', projectRoot),
        access: rootPackageJson.publishConfig?.access ?? 'public',
        registry: rootPackageJson.publishConfig?.registry ?? undefined,
      };

    }, { projectName: options.project });

  };

}
