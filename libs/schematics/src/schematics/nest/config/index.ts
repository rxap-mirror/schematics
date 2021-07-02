import { apply, applyTemplates, chain, forEach, mergeWith, move, Rule, Tree, url, } from '@angular-devkit/schematics';
import { ConfigSchema } from './schema'
import { AddPackageJsonDependency, GetProjectSourceRoot, InstallNodePackages } from '@rxap/schematics-utilities';
import { IndentationText, Project, QuoteKind, Writers } from 'ts-morph';
import { AddDir, AddNestModuleImport, ApplyTsMorphProject } from '@rxap/schematics-ts-morph';
import { formatFiles } from '@nrwl/workspace';
import { join } from 'path';

export default function (options: ConfigSchema): Rule {

  return async (host: Tree) => {

    const projectSourceRoot = GetProjectSourceRoot(host, options.project);

    const project = new Project({
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
        quoteKind: QuoteKind.Single
      },
      useInMemoryFileSystem: true
    });

    AddDir(host.getDir(projectSourceRoot), project);

    const appModule = project.getSourceFile('/app/app.module.ts');

    if (appModule) {
      AddNestModuleImport(
        appModule,
        'ConfigModule',
        [
          {
            namedImports: [ 'loadConfig', 'validate' ],
            moduleSpecifier: './configuration'
          },
          {
            namedImports: [ 'ConfigModule' ],
            moduleSpecifier: '@nestjs/config'
          }
        ],
        w => {
          w.write('ConfigModule');
          w.write('.forRoot(');
          Writers.object({
            isGlobal: 'true',
            validate: 'validate',
            load: '[ loadConfig ]'
          })(w);
          w.write(')');
        }
      );
    }

    return chain([
      mergeWith(apply(url('./files'), [
        applyTemplates({}),
        move(join(projectSourceRoot, 'app')),
        forEach(entry => {
          if (host.exists(entry.path)) {
            return null
          }
          return entry;
        })
      ])),
      ApplyTsMorphProject(project, projectSourceRoot),
      AddPackageJsonDependency('@nestjs/config', 'latest', { soft: true }),
      AddPackageJsonDependency('class-validator', 'latest', { soft: true }),
      AddPackageJsonDependency('class-transformer', 'latest', { soft: true }),
      AddPackageJsonDependency('@rxap/utilities', 'latest', { soft: true }),
      InstallNodePackages(),
      formatFiles()
    ]);

  };

}
