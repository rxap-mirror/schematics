import { chain, Rule, Tree, } from '@angular-devkit/schematics';
import { HealthIndicatorSchema } from './schema'
import { IndentationText, Project, QuoteKind } from 'ts-morph';
import { AddDir, ApplyTsMorphProject, } from '@rxap/schematics-ts-morph';
import {
  AddPackageJsonDependency,
  GetProjectSourceRoot,
  GuessProjectName,
  InstallNodePackages
} from '@rxap/schematics-utilities';
import { formatFiles } from '@nrwl/workspace';
import { CoerceHealthModule } from './coerce-health-module';
import { CoerceHealthController } from './coerce-health-controller';
import { AddHealthIndicator } from './add-health-indicator';
import { AddHealthEndpoint } from './add-health-endpoint';
import { AddToGlobalHealthEndpoint } from './add-to-global-health-endpoint';


export default function (options: HealthIndicatorSchema): Rule {

  return async (host: Tree) => {

    const projectName = GuessProjectName(host, options);
    const projectSourceRoot = GetProjectSourceRoot(host, projectName);

    const project = new Project({
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
        quoteKind: QuoteKind.Single
      },
      useInMemoryFileSystem: true
    });

    AddDir(host.getDir(projectSourceRoot), project);

    CoerceHealthModule(project);
    const controllerSourceFile = CoerceHealthController(project);
    AddHealthIndicator(project, options.name);
    AddHealthEndpoint(controllerSourceFile, options.name);
    AddToGlobalHealthEndpoint(controllerSourceFile, options.name);

    return chain([
      ApplyTsMorphProject(project, projectSourceRoot),
      AddPackageJsonDependency('@nestjs/terminus', 'latest', { soft: true }),
      InstallNodePackages(),
      formatFiles()
    ]);

  };

}
