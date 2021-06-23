import { Linter } from '@nrwl/linter';
import { UnitTestRunner } from '@nrwl/angular';

export interface AngularLibraryProjectSchema {
  name?: string;
  skipFormat: boolean;
  simpleModuleName: boolean;
  addModuleSpec?: boolean;
  directory?: string;
  sourceDir?: string;
  importPath?: string;

  spec?: boolean;
  flat?: boolean;

  prefix?: string;
  tags?: string;
  strict?: boolean;

  linter: Exclude<Linter, Linter.TsLint>;
  unitTestRunner: UnitTestRunner;

  enableIvy: boolean;

  overwrite?: boolean;
  project?: string;
}
