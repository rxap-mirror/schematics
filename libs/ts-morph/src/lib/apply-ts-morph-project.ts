import { Rule } from '@angular-devkit/schematics';
import { join } from 'path';
import { Project } from 'ts-morph';

export function ApplyTsMorphProject(project: Project, basePath: string = '', organizeImports: boolean = true): Rule {
  return tree => {

    if (organizeImports) {
      console.debug(`organize '${project.getSourceFiles().length}' ts files imports`);
      project
        .getSourceFiles()
        .forEach(sourceFile => sourceFile.organizeImports());
    }

    console.debug(`write '${project.getSourceFiles().length}' ts files to tree`);
    let written = 0;
    project
      .getSourceFiles()
      .forEach(sourceFile => {

        const filePath = join(basePath, sourceFile.getFilePath());

        if (tree.exists(filePath)) {
          const currentContent = tree.read(filePath)!.toString('utf-8');
          const newContent = sourceFile.getFullText();
          if (currentContent.trim() !== newContent.trim()) {
            written++;
            tree.overwrite(filePath, newContent);
          }
        } else {
          tree.create(filePath, sourceFile.getFullText());
          written++;
        }

      });

    console.log('written: ' + written);

  };
}
