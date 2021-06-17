import { strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  externalSchematic,
  forEach,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicsException,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import { latestVersions } from '@schematics/angular/utility/latest-versions';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { join } from 'path';
import { Readable, Writable } from 'stream';
import { addBodyClass, appendHtmlElementToHead } from '../html-manipulation';
import {
  addImportsToFile,
  addImportsToModule,
  addPackageJsonDependencies,
  getProjectIndexFiles,
  readAngularJsonFile,
  readNxJsonFile,
  writeAngularJsonFile,
} from '../utilities';
import { PwaInitSchema } from './schema';
import { LatestVersions } from '../latest-versions';

function updateAngularBuildConfiguration(projectBasePath: string, project: string): Rule {
  return (tree: Tree) => {

    const angularJson = readAngularJsonFile(tree);

    if (!angularJson.projects[ project ]) {
      throw new Error(`The project '${project}' is not defined in the angular.json`);
    }

    angularJson.projects[ project ].architect.build.configurations = {
      'production':    {
        'fileReplacements': [
          {
            'replace': join(projectBasePath, `/src/environments/environment.ts`),
            'with':    join(projectBasePath, '/src/environments/environment.prod.ts')
          },
        ],
        'optimization':     true,
        'outputHashing':    'all',
        'sourceMap':        false,
        'extractCss':       true,
        'namedChunks':      false,
        'extractLicenses':  true,
        'vendorChunk':      false,
        'buildOptimizer':   true,
        'budgets':          [
          {
            'type':           'initial',
            'maximumWarning': '2mb',
            'maximumError':   '5mb'
          },
          {
            'type':           'anyComponentStyle',
            'maximumWarning': '6kb',
            'maximumError':   '10kb'
          }
        ],
        'serviceWorker':    true,
        'ngswConfigPath': join(projectBasePath, '/src/ngsw-config.json')
      },
      'master':        {
        'fileReplacements': [
          {
            'replace': join(projectBasePath, `/src/environments/environment.ts`),
            'with':    join(projectBasePath, '/src/environments/environment.master.ts')
          },
        ],
        'optimization':     true,
        'outputHashing':    'all',
        'sourceMap':        true,
        'extractCss':       true,
        'namedChunks':      true,
        'extractLicenses':  true,
        'vendorChunk':      false,
        'buildOptimizer':   true,
        'budgets':          [
          {
            'type':           'initial',
            'maximumWarning': '2mb',
            'maximumError':   '5mb'
          },
          {
            'type':           'anyComponentStyle',
            'maximumWarning': '6kb',
            'maximumError':   '10kb'
          }
        ],
        'serviceWorker':    true,
        'ngswConfigPath': join(projectBasePath, '/src/ngsw-config.json')
      },
      'merge-request': {
        'fileReplacements': [
          {
            'replace': join(projectBasePath, `/src/environments/environment.ts`),
            'with':    join(projectBasePath, '/src/environments/environment.merge-request.ts')
          },
        ],
        'optimization':     true,
        'outputHashing':    'all',
        'sourceMap':        true,
        'extractCss':       true,
        'namedChunks':      true,
        'extractLicenses':  true,
        'vendorChunk':      false,
        'buildOptimizer':   true,
        'budgets':          [],
        'serviceWorker':    false,
        'ngswConfigPath': join(projectBasePath, '/src/ngsw-config.json')
      },
    };

    angularJson.projects[ project ].architect.build.options.assets = [
      ...angularJson.projects[ project ].architect.build.options.assets,
      join(projectBasePath, 'src/manifest.webmanifest'),
      join(projectBasePath, 'src/build.json'),
      join(projectBasePath, 'src/config.json')
    ].filter((asset, index, self) => self.indexOf(asset) === index);

    writeAngularJsonFile(tree, angularJson);

  };
}

function addFontsToIndex(projectName: string): Rule {
  return (host: Tree) => {
    const angularJson = readAngularJsonFile(host);
    const project     = angularJson.projects[ projectName ];

    if (!project) {
      throw new Error(`The project '${projectName}' is not defined in the angular.json`);
    }

    const projectIndexFiles = getProjectIndexFiles(project);

    if (!projectIndexFiles.length) {
      throw new SchematicsException('No project index HTML file could be found.');
    }

    const fonts = [
      'https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap',
      'https://fonts.googleapis.com/icon?family=Material+Icons'
    ];

    fonts.forEach(f => {
      projectIndexFiles.forEach(indexFilePath => {
        appendHtmlElementToHead(host, indexFilePath, `<link href="${f}" rel="stylesheet">`);
      });
    });

    return host;
  };
}

const RewritingStream = require('parse5-html-rewriting-stream');

function updateIndexHtmlFile(path: string): Rule {
  return (host: Tree) => {
    const buffer = host.read(path);
    if (buffer === null) {
      throw new SchematicsException(`Could not read index file: ${path}`);
    }

    const rewriter = new RewritingStream();

    let needsNoScript = true;
    rewriter.on('startTag', (startTag: { tagName: string }) => {
      if (startTag.tagName === 'noscript') {
        needsNoScript = false;
      }

      rewriter.emitStartTag(startTag);
    });

    rewriter.on('endTag', (endTag: { tagName: string }) => {
      if (endTag.tagName === 'head') {
        rewriter.emitRaw('  <link rel="manifest" href="manifest.webmanifest">\n');
        rewriter.emitRaw('  <meta name="theme-color" content="#1976d2">\n');
      } else if (endTag.tagName === 'body' && needsNoScript) {
        rewriter.emitRaw(
          '  <noscript>Please enable JavaScript to continue using this application.</noscript>\n'
        );
      }

      rewriter.emitEndTag(endTag);
    });

    return new Promise<void>(resolve => {
      const input = new Readable({
        encoding: 'utf8',
        read(): void {
          this.push(buffer);
          this.push(null);
        }
      });

      const chunks: Array<Buffer> = [];
      const output = new Writable({
        write(chunk: string | Buffer, encoding: BufferEncoding, callback: Function): void {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk, encoding) : chunk);
          callback();
        },
        final(callback: (error?: Error) => void): void {
          const full = Buffer.concat(chunks);
          host.overwrite(path, full.toString());
          callback();
          resolve();
        }
      });

      input.pipe(rewriter).pipe(output);
    });
  };
}

function addAngularPwaSupport(projectBasePath: string, projectName: string): Rule {

  return (host: Tree) => {

    const angularJson = readAngularJsonFile(host);
    const project     = angularJson.projects[ projectName ];

    if (!project) {
      throw new Error(`The project '${projectName}' is not defined in the angular.json`);
    }

    const projectIndexFiles = getProjectIndexFiles(project);

    if (!projectIndexFiles.length) {
      throw new SchematicsException('No project index HTML file could be found.');
    }

    const appModuleFilePath = join(projectBasePath, 'src/app/app.module.ts');

    return chain([
      ...projectIndexFiles.map(path => updateIndexHtmlFile(path)),
      addImportsToModule(appModuleFilePath, {
        'ServiceWorkerModule': {
          path:   '@angular/service-worker',
          module: 'ServiceWorkerModule.register(\'ngsw-worker.js\', { enabled: environment.serviceWorker, registrationStrategy: \'registerWhenStable:30000\' })'
        }
      }),
      addImportsToFile(appModuleFilePath, { 'environment': '../environments/environment' }),
      addPackageJsonDependencies(
        NodeDependencyType.Default,
        `!@angular/service-worker@${latestVersions.Angular.replace(/\.\d+$/, '')}`,
      ),
    ]);

  };

}

function addTypographyClass(projectName: string): Rule {
  return (host: Tree) => {
    const angularJson = readAngularJsonFile(host);
    const project     = angularJson.projects[ projectName ];

    if (!project) {
      throw new Error(`The project '${projectName}' is not defined in the angular.json`);
    }
    const projectIndexFiles = getProjectIndexFiles(project);

    if (!projectIndexFiles.length) {
      throw new SchematicsException('No project index HTML file could be found.');
    }

    projectIndexFiles.forEach(path => addBodyClass(host, path, 'mat-typography'));

    return host;
  };
}

function addAngularMaterialSupport(projectBasePath: string, projectName: string): Rule {
  return chain([
    addPackageJsonDependencies(
      NodeDependencyType.Default,
      `!@angular/cdk@${latestVersions.Angular.replace(/\.\d+$/, '')}`,
      `!@angular/material@${latestVersions.Angular.replace(/\.\d+$/, '')}`
    ),
    addImportsToModule(join(projectBasePath, 'src/app/app.module.ts'), {
      'BrowserAnimationsModule': {
        path:   '@angular/platform-browser/animations',
        module: 'BrowserAnimationsModule'
      }
    }),
    addTypographyClass(projectName),
    addFontsToIndex(projectName)
  ]);
}

function addFeaturesIndexTheme(): Rule {
  return tree => {

    const featureIndexThemeFilePath = 'libs/feature/_index.scss';

    if (!tree.exists(featureIndexThemeFilePath)) {
      tree.create(featureIndexThemeFilePath, `/* IMPORT */

@mixin feature-theme($theme) {

  /* THEME_INCLUDE */

}

@mixin feature-typography($config) {

  /* TYPOGRAPHY_INCLUDE */

}`);
    }

  }
}

export default function(options: PwaInitSchema): Rule {

  return async (host: Tree) => {

    const nx            = readNxJsonFile(host);
    const prefix        = nx.npmScope;
    let projectBasePath = join('apps', options.project);
    const projectName   = options.project;

    const workspace = await getWorkspace(host);

    const hasProject = workspace.projects.has(projectName);

    if (hasProject) {
      console.log(`Project '${projectName}' already exists`);
      projectBasePath = workspace.projects.get(projectName)!.root;
    }


    return chain([
      hasProject ? noop() : chain([
        externalSchematic('@nrwl/angular', 'application', {
          name:           projectName,
          enableIvy:      true,
          routing:        false,
          style:          'scss',
          unitTestRunner: 'jest',
          e2eTestRunner:  'cypress',
          skipTests:      true
        }),
        addAngularPwaSupport(projectBasePath, projectName),
        addAngularMaterialSupport(projectBasePath, projectName),
        addImportsToModule(
          join(projectBasePath, 'src/app/app.module.ts'),
          { 'AppRoutingModule': { path: './app-routing.module', module: 'AppRoutingModule' } }
        ),
        addFeaturesIndexTheme()
      ]),
      addPackageJsonDependencies(
        NodeDependencyType.Default,
        '!normalize.css@8.0',
        `!@rxap/config@${LatestVersions.config}`,
        `!@rxap/environment@${LatestVersions.environment}`,
        `!@rxap/utilities@${LatestVersions.utilities}`,
        `!@angular/localize@${latestVersions.Angular.replace(/\.\d+$/, '')}`
      ),
      updateAngularBuildConfiguration(projectBasePath, projectName),
      mergeWith(apply(url('./files'), [
        template({ prefix, ...strings, project: projectName }),
        move(projectBasePath),
        forEach(entry => {
          if (host.exists(entry.path)) {
            host.overwrite(entry.path, entry.content);
          }
          return entry;
        }),
      ]), MergeStrategy.Overwrite)
    ]);

  };

}
