import { Rule } from '@angular-devkit/schematics';
import { join } from 'path';
import { Node, Project, SourceFile } from 'ts-morph';
import { FixMissingImports } from './fix-missing-imports';

function areSame(sourceFile1: SourceFile, sourceFile2: SourceFile) {
  const leafNodes1 = getLeafNodes(sourceFile1);
  const leafNodes2 = getLeafNodes(sourceFile2);

  while ( true ) {
    const leaf1 = leafNodes1.next();
    const leaf2 = leafNodes2.next();

    if (leaf1.done && leaf2.done) {
      return true;
    }
    if (leaf1.done || leaf2.done) {
      return false;
    }
    if (leaf1.value.getText() !== leaf2.value.getText()) {
      return false;
    }
  }

  function* getLeafNodes(sourceFile: SourceFile): Iterator<Node> {
    yield* searchNode(sourceFile);

    // @ts-ignore
    function* searchNode(node: Node) {
      const children = node.getChildren();
      if (children.length === 0) {
        yield node;
      } else {
        for (const child of children) {
          yield * searchNode(child);
        }
      }
    }
  }
}

export function ApplyTsMorphProject(project: Project, basePath: string = '', organizeImports: boolean = true, fixMissingImports: boolean = false): Rule {
  return tree => {

    if (organizeImports || fixMissingImports) {
      project
      .getSourceFiles()
      .forEach(sourceFile => {
        if (fixMissingImports) {
          sourceFile.fixMissingImports();
        }
        if (organizeImports) {
          sourceFile.organizeImports()
        }
      });
    }

    project
    .getSourceFiles()
    .forEach(sourceFile => {

      const filePath = join(basePath, sourceFile.getFilePath());

      if (tree.exists(filePath)) {
        const currentContent = tree.read(filePath)!.toString('utf-8');
        const tmpProject     = new Project();
        const newContent     = sourceFile.getFullText();
        if (!areSame(sourceFile, tmpProject.createSourceFile('/tmp.ts', currentContent))) {
          tree.overwrite(filePath, newContent);
        }
      } else {
        tree.create(filePath, sourceFile.getFullText());
      }

    });

  };
}
