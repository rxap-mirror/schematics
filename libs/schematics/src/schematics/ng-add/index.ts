import { chain, noop, Rule, schematic } from '@angular-devkit/schematics';
import { InstallPeerDependencies } from '@rxap/schematics-utilities';
import { NgAddSchema } from './schema';

export default function (options: NgAddSchema): Rule {

  return chain([
    InstallPeerDependencies(),
    options.init ? schematic('init', { overwrite: options.overwrite }) : noop(),
  ]);

}
