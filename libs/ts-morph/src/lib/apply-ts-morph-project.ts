import { Rule } from '@angular-devkit/schematics';
import { join } from 'path';
import { Project } from 'ts-morph';

export function ApplyTsMorphProject(project: Project, basePath: string = '', organizeImports: boolean = true): Rule {
  return tree => {

    if (organizeImports) {
      project
        .getSourceFiles()
        .forEach(sourceFile => sourceFile.organizeImports());
    }

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

  };
}
