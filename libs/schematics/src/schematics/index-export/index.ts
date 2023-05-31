import {IndexExportGeneratorSchema} from './schema';
import {CoerceFile, GetProjectSourceRoot} from "@rxap/schematics-utilities";
import {Tree} from "@angular-devkit/schematics";
import {relative, join} from "path";

export default function (options: IndexExportGeneratorSchema) {

  return (host: Tree) => {

    const sourceRoot = GetProjectSourceRoot(host, options.project);

    const filePathList: string[] = [];

    host.getDir(sourceRoot).visit((path, entry) => {
      if (
        path.endsWith('.ts') &&
        !path.endsWith('.spec.ts') &&
        !path.endsWith('.d.ts') &&
        !path.endsWith('index.ts') &&
        path.startsWith('/' + join(sourceRoot, 'lib') + '/')
      ) {
        const relativePath = relative('/' + sourceRoot, path);
        filePathList.push(relativePath);
      }
    });

    const map = new Map<string, string[]>();

    for (const filePath of filePathList) {
      const fragments = filePath.split('/');
      const fileName = fragments.pop()!;
      const basePath = fragments.join('/');
      if (!map.has(basePath)) {
        map.set(basePath, []);
      }
      map.get(basePath)!.push(fileName);
    }

    let rootIndexFile = '';

    for (const basePath of map.keys()) {
      const fullBasePath = join(sourceRoot, basePath);
      let indexFile = '';

      for (const fileName of map.get(basePath)!) {
        indexFile += `export * from './${fileName.replace(/\.ts$/, '')}';\n`;
      }

      const indexFilePath = join(fullBasePath, 'index.ts');

      CoerceFile(host, indexFilePath, indexFile);
      rootIndexFile += `export * from './${basePath}';\n`;
    }

    CoerceFile(host, join(sourceRoot, 'index.ts'), rootIndexFile);

  }

}

