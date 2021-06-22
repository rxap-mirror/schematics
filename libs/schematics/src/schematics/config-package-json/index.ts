import { Rule, Tree, } from '@angular-devkit/schematics';
import { ConfigPackageJsonSchema } from './schema'
import {
  GetPackageJson,
  GetProjectRoot,
  GetRelativePathToProjectRoot,
  UpdateProjectPackageJson
} from '@rxap/schematics-utilities';
import { unique } from '@rxap/utilities';
import { join } from 'path';

export default function (options: ConfigPackageJsonSchema): Rule {

  return async (host: Tree) => {

    const rootPackageJson = GetPackageJson(host);
    const projectRoot = GetProjectRoot(host, options.project);

    return UpdateProjectPackageJson(packageJson => {

      packageJson.private = false;
      packageJson.author = rootPackageJson.author;
      packageJson.homepage = rootPackageJson.homepage + '/' + projectRoot;
      packageJson.repository = rootPackageJson.repository;

      if (!packageJson.keywords) {
        packageJson.keywords = [];
      }
      packageJson.keywords.push(...(rootPackageJson.keywords ?? []));
      packageJson.keywords = packageJson.keywords.filter(unique());

      if (packageJson.license) {
        packageJson.license = rootPackageJson.license;
      }

      packageJson.bugs = rootPackageJson.bugs;
      packageJson.publishConfig = {
        directory: join(GetRelativePathToProjectRoot(host, options.project), 'dist', projectRoot),
        access: 'public'
      };

    }, { projectName: options.project });

  };

}
