import { chain, Rule, Tree, } from '@angular-devkit/schematics';
import { HealthIndicatorSchema } from './schema'
import { IndentationText, Project, QuoteKind, Scope } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { CoerceSuffix } from '@rxap/utilities';
import {
  AddDir,
  AddNestModuleProvider,
  ApplyTsMorphProject,
  FindNestModuleSourceFile,
} from '@rxap/schematics-ts-morph';
import { AddPackageJsonDependency, InstallNodePackages } from '@rxap/schematics-utilities';
import { formatFiles } from '@nrwl/workspace';

const { dasherize, classify } = strings;

export default function (options: HealthIndicatorSchema): Rule {

  return async (host: Tree) => {

    const project = new Project({
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
        quoteKind: QuoteKind.Single
      },
      useInMemoryFileSystem: true
    });

    const indicatorSourceFile = project.createSourceFile(`${dasherize(options.name)}.health-indicator.ts`);

    const indicatorClassName = CoerceSuffix(classify(options.name), 'HealthIndicator')

    indicatorSourceFile.addClass({
      name: indicatorClassName,
      isExported: true,
      decorators: [
        {
          name: 'Injectable',
          arguments: []
        }
      ],
      extends: 'HealthIndicator',
      ctors: [
        {
          parameters: [],
          statements: 'super();'
        }
      ],
      methods: [
        {
          name: 'isHealthy',
          isAsync: true,
          scope: Scope.Public,
          returnType: 'Promise<HealthIndicatorResult>',
          statements: [
            `throw new HealthCheckError('Not yet implemented!', this.getStatus('${dasherize(options.name)}', false))`,
          ]
        }
      ]
    });

    indicatorSourceFile.addImportDeclarations([
      {
        namedImports: [ 'Injectable' ],
        moduleSpecifier: '@nestjs/common'
      },
      {
        namedImports: [ 'HealthCheckError', 'HealthIndicator', 'HealthIndicatorResult' ],
        moduleSpecifier: '@nestjs/terminus'
      }
    ]);

    AddDir(host.getDir(options.path), project);

    const moduleSourceFile = FindNestModuleSourceFile(project, '/');

    if (moduleSourceFile) {
      AddNestModuleProvider(
        moduleSourceFile,
        indicatorClassName,
        [
          {
            namedImports: [ indicatorClassName ],
            moduleSpecifier: `./${dasherize(options.name)}.health-indicator`
          }
        ]
      );
    }

    return chain([
      ApplyTsMorphProject(project, options.path),
      AddPackageJsonDependency('@nestjs/terminus', 'latest', { soft: true }),
      InstallNodePackages(),
      formatFiles()
    ]);

  };

}
