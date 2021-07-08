import { Rule } from '@angular-devkit/schematics';
import { DeleteRecursive } from '@rxap/schematics-utilities';
import { join } from 'path';

export function DeleteExistingApp(projectSourceRoot: string): Rule {
  return tree => {
    DeleteRecursive(tree, tree.getDir(join(projectSourceRoot, 'app')));
    DeleteRecursive(tree, tree.getDir(join(projectSourceRoot, 'environments')));
    DeleteRecursive(tree, tree.getDir(join(projectSourceRoot, 'assets')));
    DeleteRecursive(tree, tree.getDir(join(projectSourceRoot, 'scss')));
    [ 'main.ts', 'favicon.ico', 'manifest.webmanifest', 'styles.scss', '_index.scss' ].forEach(file => {
      if (tree.exists(join(projectSourceRoot, file))) {
        tree.delete(join(projectSourceRoot, file));
      }
    });
  }
}
