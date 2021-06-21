import { chain, Rule, } from '@angular-devkit/schematics';
import { ConfigNgUpdateSchema } from './schema'
import { UpdateProjectPackageJson } from '@rxap/schematics-utilities';
import { unique } from '@rxap/utilities';

export default function (options: ConfigNgUpdateSchema): Rule {

  return async () => {

    return chain([
      UpdateProjectPackageJson(packageJson => {

        if (!packageJson['ng-update']) {
          packageJson['ng-update'] = {};
        }

        if (!packageJson['ng-update'].packageGroup) {
          packageJson['ng-update'].packageGroup = [];
        }

        packageJson['ng-update'].packageGroup = [
          packageJson.name,
          ...packageJson['ng-update'].packageGroup,
        ].filter(unique());

      }, { projectName: options.project }),
    ]);

  };

}
