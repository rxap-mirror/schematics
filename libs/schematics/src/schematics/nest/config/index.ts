import { chain, Rule, Tree, } from '@angular-devkit/schematics';
import { ConfigSchema } from './schema'
import { AddPackageJsonDependency, InstallNodePackages } from '@rxap/schematics-utilities';
import { IndentationText, Project, QuoteKind, Writers } from 'ts-morph';
import { AddDir, AddNestModuleImport, ApplyTsMorphProject } from '@rxap/schematics-ts-morph';
import { formatFiles } from '@nrwl/workspace';

export default function (options: ConfigSchema): Rule {

  return async (host: Tree) => {

    const project = new Project({
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
        quoteKind: QuoteKind.Single
      },
      useInMemoryFileSystem: true
    });

    const sourceFile = project.createSourceFile('configuration.ts');

    sourceFile.addInterface({
      isExported: true,
      name: 'Config'
    });

    sourceFile.addFunction({
      isExported: true,
      name: 'LoadConfig',
      returnType: 'Config',
      statements: [
        'const config: Config = {};',
        'console.log(JSON.stringify(config, undefined, 2));',
        'return config;'
      ]
    })

    AddDir(host.getDir(options.path), project);

    const appModule = project.getSourceFile('/app.module.ts');

    if (appModule) {
      AddNestModuleImport(
        appModule,
        'ConfigModule',
        [
          {
            namedImports: [ 'LoadConfig' ],
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
            load: '[ loadConfig ]'
          });
          w.write(')');
        }
      );
    }

    return chain([
      ApplyTsMorphProject(project, options.path),
      AddPackageJsonDependency('@nestjs/config', 'latest', { soft: true }),
      InstallNodePackages(),
      formatFiles()
    ]);

  };

}
