import { Rule, SchematicsException } from '@angular-devkit/schematics';
import { join } from 'path';
import { NodePackageBuilderOptions } from '@nrwl/node/src/executors/package/utils/models';
import { UpdateAngularProject } from '@rxap/schematics-utilities';

export function AddBuildTarget(projectName: string): Rule {
  return UpdateAngularProject(project => {

    if (!project.root) {
      throw new SchematicsException(`The root for the project '${projectName}' is not defined.`);
    }

    if (!project.targets.has('build')) {
      project.targets.add('build', {
        builder: '@nrwl/node:package',
        options: {
          outputPath: join('dist', project.root),
          tsConfig: join(project.root, 'tsconfig.lib.json'),
          packageJson: join(project.root, 'package.json'),
          main: join(project.root, 'src/index.ts'),
          srcRootForCompilationRoot: project.root,
          assets: [
            join(project.root, '*.md')
          ],
        },
        outputs: [ '{options.outputPath}' ]
      } as any);
    }

    const target = project.targets.get<NodePackageBuilderOptions>('build')!;

    if (!Array.isArray(target.options.assets)) {
      target.options.assets = [];
    }

    if (!target.options.assets.includes(join(project.root, '*.md'))) {
      target.options.assets.push(join(project.root, '*.md'));
    }

    target.options.buildableProjectDepsInPackageJsonType = 'dependencies';

  }, { projectName });
}
