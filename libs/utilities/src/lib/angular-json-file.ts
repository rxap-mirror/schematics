import { Rule, Tree } from '@angular-devkit/schematics';
import { AngularJson } from './angular-json';
import { GetJsonFile, UpdateJsonFile } from './json-file';
import { Project } from './angular-json/project';
import { CliOptions } from './angular-json/cli-options';
import { SchematicOptions } from './angular-json/schematic-options';
import { I18n } from './angular-json/i18n';
import { SchematicsException } from '@angular-devkit/schematics';
import { Target } from './angular-json/target';

export function GetAngularJson(host: Tree): AngularJson {
  return GetJsonFile(host, 'angular.json');
}

export class AngularProjectTargetConfigurationsMap {

  private readonly _map = new Map<string, Record<string, any>>();

  constructor(private readonly _configurationsMap: Record<string, Record<string, any>>) {
    for (const [name, configuration] of Object.entries(_configurationsMap)) {
      this._map.set(name, configuration);
    }
  }

  public add(name: string, configuration: Record<string, any>) {
    if (this._map.has(name)) {
      throw new Error(`A configuration with the name '${name}' already exists`);
    }
    this._map.set(name, configuration);
    this._configurationsMap[name] = configuration;
  }

  public get(name: string): Record<string, any> | undefined {
    return this._map.get(name);
  }

  public has(name: string): boolean {
    return this._map.has(name);
  }

  public delete(name: string): boolean {
    const success = this._map.delete(name);
    if (success) {
      delete this._configurationsMap[name];
    }
    return success;
  }

}

export class AngularProjectTarget {

  public get builder(): string {
    return this._target.builder;
  }

  public set builder(builder: string) {
    this._target.builder = builder;
  }

  public get options(): Record<string, any> {
    return this._target.options;
  }

  public set options(options: Record<string, any>) {
    this._target.options = options;
  }

  public get configurations(): Record<string, Record<string, any>> {
    return this._target.configurations;
  }

  public set configurations(configurations: Record<string, Record<string, any>>) {
    this._target.configurations = configurations;
  }

  constructor(private _target: Target) {}

}

export class AngularProjectTargetMap {

  private readonly _map = new Map<string, AngularProjectTarget>();

  constructor(private readonly _targetMap: Record<string, Target>) {
    for (const [name, target] of Object.entries(_targetMap)) {
      const angularProjectTarget = new AngularProjectTarget(target);
      this._map.set(name, angularProjectTarget);
    }
  }

  public add(name: string, target: Target) {
    if (this._map.has(name)) {
      throw new Error(`A target with the name '${name}' already exists`);
    }
    this._map.set(name, new AngularProjectTarget(target));
    this._targetMap[name] = target;
  }

  public get(name: string): AngularProjectTarget | undefined {
    return this._map.get(name);
  }

  public has(name: string): boolean {
    return this._map.has(name);
  }

  public delete(name: string): boolean {
    const success = this._map.delete(name);
    if (success) {
      delete this._targetMap[name];
    }
    return success;
  }

}

export class AngularProject {

  public get prefix(): string | undefined {
    return this._project.prefix;
  }

  public get cli(): CliOptions {
    if (!this._project.cli) {
      this._project.cli = {};
    }
    return this._project.cli;
  }

  public get schematics(): SchematicOptions {
    if (!this._project.schematics) {
      this._project.schematics = {};
    }
    return this._project.schematics;
  }

  public get root(): string | undefined {
    return this._project.root;
  }

  public get i18n(): I18n {
    if (!this._project.i18n) {
      this._project.i18n = {};
    }
    return this._project.i18n;
  }

  public get sourceRoot(): string | undefined {
    return this._project.sourceRoot;
  }

  public get projectType(): string | undefined {
    return this._project.projectType;
  }

  public readonly targets: AngularProjectTargetMap;

  constructor(public readonly _project: Project) {
    if (!this._project.targets && !this._project.architect) {
      this._project.targets = {} as any
    }
    this.targets = new AngularProjectTargetMap(this._project.architect ?? this._project.targets);
  }
}

export class AngularProjectMap {
  private readonly _map = new Map<string, AngularProject>();

  constructor(public readonly _projectMap: Record<string, Project>) {
    for (const [name, project] of Object.entries(_projectMap)) {
      const angularProject = new AngularProject(project);
      this._map.set(name, angularProject);
    }
  }

  public add(name: string, project: Project) {
    if (this._map.has(name)) {
      throw new Error(`A project with the name '${name}' already exists`);
    }
    this._map.set(name, new AngularProject(project));
    this._projectMap[name] = project;
  }

  public get(name: string): AngularProject | undefined {
    return this._map.get(name);
  }

  public has(name: string): boolean {
    return this._map.has(name);
  }

  public delete(name: string): boolean {
    const success = this._map.delete(name);
    if (success) {
      delete this._projectMap[name];
    }
    return success;
  }
}

export class Angular {
  public get defaultProject(): AngularProject | undefined {
    return this._angular.defaultProject
      ? this.projects.get(this._angular.defaultProject)
      : undefined;
  }

  public readonly projects: AngularProjectMap;

  constructor(private readonly _angular: AngularJson) {
    if (!this._angular.projects) {
      this._angular.projects = {} as any;
    }
    this.projects = new AngularProjectMap(this._angular.projects!);
  }
}

export function UpdateAngularJson(
  updater: (angular: Angular) => void | PromiseLike<void>,
  space: string | number = 2
): Rule {
  return UpdateJsonFile(
    async (angularJson: AngularJson) => {
      try {
        await updater(new Angular(angularJson));
      } catch (e) {
        throw new SchematicsException(
          `Could not update the angular.json: ${e.message}`
        );
      }
    },
    'angular.json',
    space
  );
}
