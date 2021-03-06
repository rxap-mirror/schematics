import { strings } from '@angular-devkit/core';
import { chain, externalSchematic, noop, Rule, Tree } from '@angular-devkit/schematics';
import { NodeFactory } from '@rxap/schematics-html';
import { AddComponentProvider, AddDir, AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import {
  ElementChild,
  ElementChildRawContent,
  ElementChildren,
  ElementChildTextContent,
  ElementDef,
  ElementExtends,
} from '@rxap/xml-parser/decorators';
import { join } from 'path';
import { SourceFile } from 'ts-morph';
import {
  FormElement as DefinitionFormElement,
  LoadHandleMethod,
  SubmitHandleMethod,
} from '../../generate/elements/form.element';
import { ParseFormElement } from '../../generate/parse-form-element';
import { GenerateSchema } from '../schema';
import { FormFeatureElement } from './features/form-feature.element';
import { GroupElement } from './group.element';
import { NodeElement } from './node.element';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(NodeElement)
@ElementDef('definition')
export class FormElement extends GroupElement {

  public get logicTemplate(): string {
    return this._logicTemplate ?? join('forms', dasherize(this.form ?? this.name) + '.xml');
  }

  @ElementChildRawContent({
    tag: 'template',
  })
  public set logicTemplate(value: string) {
    this._logicTemplate = value;
  }

  @ElementChildren(FormFeatureElement, { group: 'features' })
  public features?: FormFeatureElement[];

  @ElementChildTextContent()
  public form?: string;

  @ElementChild(SubmitHandleMethod)
  public submit?: SubmitHandleMethod;

  @ElementChild(LoadHandleMethod)
  public load?: LoadHandleMethod;

  @ElementChildTextContent()
  public title?: string;

  public get formElement(): DefinitionFormElement | null {
    return this._formElement;
  }

  private _formElement: DefinitionFormElement | null = null;

  private _logicTemplate?: string;

  public template(): string {
    return NodeFactory(
      'form',
      'rxapForm',
    )([...this.nodes, ...(this.features ?? [])]);
  }

  public get controlPath(): string {
    return this.name;
  }

  public handleComponent({
    project,
    sourceFile,
    options,
  }: ToValueContext<GenerateSchema> & { sourceFile: SourceFile }) {
    this.nodes.forEach((node) =>
      node.handleComponent({ project, sourceFile, options })
    );
    this.features?.forEach((feature) =>
      feature.handleComponent({ project, sourceFile, options })
    );
    AddComponentProvider(
      sourceFile,
      'FormProviders',
      [
        {
          namedImports: ['FormProviders'],
          moduleSpecifier: './form.providers',
        },
      ],
      options.overwrite
    );
    AddComponentProvider(
      sourceFile,
      'FormComponentProviders',
      [
        {
          namedImports: ['FormComponentProviders'],
          moduleSpecifier: './form.providers',
        },
      ],
      options.overwrite
    );
    this.submit?.handleComponent({ project, options, sourceFile });
    this.load?.handleComponent({ project, options, sourceFile });
  }

  public handleComponentModule({
    project,
    sourceFile,
    options,
  }: ToValueContext<GenerateSchema> & { sourceFile: SourceFile }) {
    this.nodes.forEach((node) =>
      node.handleComponentModule({ project, sourceFile, options })
    );
    this.features?.forEach((feature) =>
      feature.handleComponentModule({ project, sourceFile, options })
    );
    AddNgModuleImport(sourceFile, 'RxapFormsModule', '@rxap/forms');
  }

  public toValue({ project, options, host }: ToValueContext<GenerateSchema> & { host: Tree }): Rule {
    const componentFile             = dasherize(options.name!) + '-form.component.ts';
    const componentModuleFile       =
            dasherize(options.name!) + '-form.component.module.ts';
    const componentTemplateFilePath = join(
      options.path!,
      dasherize(options.name!) + '-form.component.html',
    );
    this._formElement               = ParseFormElement(host, this.logicTemplate, options.templateBasePath);
    return chain([
      externalSchematic('@rxap/schematics-form', 'generate', {
        project:          options.project,
        name:             options.name,
        template:         this.logicTemplate,
        path:             options.path?.replace(/^\//, '') ?? '',
        flat:             true,
        organizeImports:  false,
        fixImports:       false,
        format:           false,
        templateBasePath: options.templateBasePath,
        openApiModule:    options.openApiModule,
        overwrite:        options.overwrite,
        skipTsFiles:      options.skipTsFiles,
      }),
      options.overwrite
        ? (tree) => tree.overwrite(componentTemplateFilePath, this.template())
        : noop(),
      (tree) =>
        AddDir(
          tree.getDir(options.path!),
          project,
          undefined,
          (pathFragment) => !!pathFragment.match(/\.ts$/)
        ),
      chain(this.nodes.map((node) => node.toValue({ project, options }))),
      chain(
        this.features?.map((feature) =>
          feature.toValue({ project, options })
        ) ?? []
      ),
      () =>
        this.handleComponent({
          project,
          options,
          sourceFile: project.getSourceFileOrThrow(componentFile),
        }),
      () =>
        this.handleComponentModule({
          project,
          options,
          sourceFile: project.getSourceFileOrThrow(componentModuleFile),
        }),
      () => this.submit?.toValue({ project, options }) ?? noop(),
      () => this.load?.toValue({ project, options }) ?? noop(),
    ]);
  }
}
