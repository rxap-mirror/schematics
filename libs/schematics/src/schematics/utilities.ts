import { virtualFs, workspaces, } from '@angular-devkit/core';
import { Rule, Tree, } from '@angular-devkit/schematics';
import {
  ImportDeclarationStructure,
  IndentationText,
  Node,
  OptionalKind,
  Project,
  SourceFile,
  StructureKind,
} from 'ts-morph';
import { addPackageJsonDependency, NodeDependencyType, } from '@schematics/angular/utility/dependencies';
import { BrowserBuilderTarget, BuilderTarget, WorkspaceProject, } from '@schematics/angular/utility/workspace-models';

function createHost(tree: Tree): workspaces.WorkspaceHost {
  return {
    async readFile(path: string): Promise<string> {
      const data = tree.read(path);
      if (!data) {
        throw new Error('File not found.');
      }

      return virtualFs.fileBufferToString(data);
    },
    async writeFile(path: string, data: string): Promise<void> {
      return tree.overwrite(path, data);
    },
    async isDirectory(path: string): Promise<boolean> {
      // approximate a directory check
      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;
    },
    async isFile(path: string): Promise<boolean> {
      return tree.exists(path);
    }
  };
}

export async function getWorkspace(tree: Tree, path = '/') {
  const host = createHost(tree);

  const { workspace } = await workspaces.readWorkspace(path, host);

  return workspace;
}

/**
 * Build a default project path for generating.
 * @param project The project which will have its default path generated.
 */
export function buildDefaultPath(project: workspaces.ProjectDefinition): string {
  const root           = project.sourceRoot ? `/${project.sourceRoot}/` : `/${project.root}/src/`;
  const projectDirName = project.extensions[ 'projectType' ] === 'application' ? 'app' : 'lib';

  return `${root}${projectDirName}`;
}

export function addImportsToSourceFile(sourceFile: SourceFile, importStructures: Array<OptionalKind<ImportDeclarationStructure>>): void {

  const importDeclarations = sourceFile.getImportDeclarations();

  for (const importStructure of importStructures) {

    const existingImportStructure = importDeclarations.find(id => id.getModuleSpecifier().getLiteralValue() === importStructure.moduleSpecifier);

    if (existingImportStructure) {

      if (!Array.isArray(importStructure.namedImports)) {
        throw new Error('Named imports is not an array');
      }

      for (const namedImport of importStructure.namedImports) {

        if (typeof namedImport === 'object') {

          if (!existingImportStructure.getNamedImports().find(ni => ni.getName() === namedImport.name)) {
            existingImportStructure.addNamedImport(namedImport);
          }

        }

      }

    } else {
      sourceFile.addImportDeclaration(importStructure);
    }

  }

}

export function addPackageJsonDependencies(type: NodeDependencyType, ...dependencies: string[]): Rule {
  return (host: Tree) => {
    for (const dependency of dependencies) {
      const match = dependency.match(/^(!)?(@[^\/]+\/)?([^@]+)@(.+)$/);
      if (match && match[ 3 ] && match[ 4 ]) {
        const overwrite   = !!match[ 1 ];
        const scope       = match[ 2 ] ?? '';
        const packageName = match[ 3 ];
        const version     = match[ 4 ];
        addPackageJsonDependency(host, {
          type,
          name: scope + packageName,
          version,
          overwrite
        });
      }
    }
  };
}

export function addPackageJsonScript(host: Tree, name: string, script: string): void {

  const packageJson = readPackageJsonFile(host);

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  packageJson.scripts[ name ] = script;

  writePackageJsonFile(host, packageJson);

}

export function addPackageJsonScripts(scripts: Record<string, string>): Rule {
  return (host: Tree) => {
    for (const [ name, script ] of Object.entries(scripts)) {
      addPackageJsonScript(host, name, script);
    }
  };
}

export function readPackageJsonFile(host: Tree) {
  const packageJsonFilePath = 'package.json';

  if (!host.exists(packageJsonFilePath)) {
    throw new Error('Could not find package json file');
  }

  return JSON.parse(host.read('package.json')!.toString());
}

export function writePackageJsonFile(host: Tree, packageJson: any) {
  host.overwrite('package.json', JSON.stringify(packageJson, null, 2));
}

export function readAngularJsonFile(host: Tree) {
  const packageJsonFilePath = 'angular.json';

  if (!host.exists(packageJsonFilePath)) {
    throw new Error('Could not find angular json file');
  }

  return JSON.parse(host.read('angular.json')!.toString());
}

export function writeAngularJsonFile(host: Tree, angularJson: any) {
  host.overwrite('angular.json', JSON.stringify(angularJson, null, 2));
}

export function readNxJsonFile(host: Tree) {
  const packageJsonFilePath = 'nx.json';

  if (!host.exists(packageJsonFilePath)) {
    throw new Error('Could not find nx json file');
  }

  return JSON.parse(host.read('nx.json')!.toString());
}

export function addImportsToFile(filePath: string, imports: { [ importName: string ]: string }): Rule {
  return (host: Tree) => {

    if (!host.exists(filePath)) {
      throw new Error('Could not find file');
    }

    const sourceText = host.read(filePath)!.toString();

    const project    = new Project({ manipulationSettings: { indentationText: IndentationText.TwoSpaces } });
    const sourceFile = project.createSourceFile(filePath, sourceText);

    addImportsToSourceFile(sourceFile, Object.entries(imports).map(([ importName, importPath ]) => (
      {
        kind:            StructureKind.ImportDeclaration,
        namedImports:    [
          {
            name: importName,
            kind: StructureKind.ImportSpecifier
          }
        ],
        moduleSpecifier: importPath
      }
    )));

    host.overwrite(filePath, sourceFile.getFullText());

  };
}

export function addImportsToModule(moduleFilePath: string, imports: { [ moduleName: string ]: { path: string, module: string } }): Rule {
  return (host: Tree) => {

    if (!host.exists(moduleFilePath)) {
      throw new Error(`Could not find module: '${moduleFilePath}'`);
    }

    const sourceText = host.read(moduleFilePath)!.toString();

    const project    = new Project({ manipulationSettings: { indentationText: IndentationText.TwoSpaces } });
    const sourceFile = project.createSourceFile(moduleFilePath, sourceText);

    const classes = sourceFile.getClasses();

    const moduleClass = classes.find(cls => cls.getDecorators().some(dec => dec.getName() === 'NgModule'));

    if (!moduleClass) {
      throw new Error('Could not find module class');
    }

    const moduleDecorator = moduleClass.getDecorators().find(dec => dec.getName() === 'NgModule')!;

    const moduleMetadataNode = moduleDecorator.getArguments()[ 0 ];

    if (Node.isObjectLiteralExpression(moduleMetadataNode)) {

      const importPropertyAssignment = moduleMetadataNode.getProperty('imports');

      if (importPropertyAssignment && Node.isPropertyAssignment(importPropertyAssignment)) {

        const arrayinit = importPropertyAssignment.getInitializer();

        if (arrayinit && Node.isArrayLiteralExpression(arrayinit)) {
          for (const [ moduleName, { path, module } ] of Object.entries(imports)) {
            if (!arrayinit.getElements().some(element => element.getFullText() === module)) {
              arrayinit.addElement(module);
              addImportsToSourceFile(sourceFile, [
                {
                  kind:            StructureKind.ImportDeclaration,
                  namedImports:    [
                    {
                      name: moduleName,
                      kind: StructureKind.ImportSpecifier
                    }
                  ],
                  moduleSpecifier: path
                }
              ]);
            }
          }
        } else {
          throw new Error('Could not find import property init');
        }

      } else {
        throw new Error('Could not find import property');
      }

    } else {
      throw new Error('Could not find module meta data');
    }

    host.overwrite(moduleFilePath, sourceFile.getFullText());

  };
}

/** Object that maps a CLI target to its default builder name. */
export const defaultTargetBuilders = {
  build: '@angular-devkit/build-angular:browser',
  test:  '@angular-devkit/build-angular:karma',
};

/** Gets all targets from the given project that match the specified builder name. */
export function getTargetsByBuilderName(
  project: WorkspaceProject, builderName: string): BuilderTarget<any, unknown>[] {
  const targets = project.targets || project.architect || {};
  return Object.keys(targets)
               .filter(name => targets[ name ].builder === builderName)
               .map(name => targets[ name ]);
}

/** Gets the path of the index file in the given project. */
export function getProjectIndexFiles(project: WorkspaceProject): string[] {
  // Use a set to remove duplicate index files referenced in multiple build targets
  // of a project.
  return [
    ...new Set(
      (getTargetsByBuilderName(project, defaultTargetBuilders.build) as BrowserBuilderTarget[])
        .filter(t => t.options.index)
        .map(t => t.options.index!)),
  ];
}
