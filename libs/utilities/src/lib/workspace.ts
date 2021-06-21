import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { Angular, GetJsonFile } from '@rxap/schematics-utilities';

export function GetWorkspace(host: Tree) {

  if (host.exists('.angular.json')) {
    return new Angular(GetJsonFile(host, '.angular.json'));
  }

  if (host.exists('angular.json')) {
    return new Angular(GetJsonFile(host, 'angular.json'));
  }

  if (host.exists('workspace.json')) {
    return new Angular(GetJsonFile(host, 'workspace.json'));
  }

  throw new SchematicsException('Could not find the workspace configuration file.');

}
