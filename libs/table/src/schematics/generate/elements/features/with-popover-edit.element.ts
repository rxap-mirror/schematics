import { FeatureElement } from './feature.element';
import {
  ElementChildRawContent,
  ElementChildTextContent,
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { strings } from '@angular-devkit/core';
import { SourceFile } from 'ts-morph';
import {
  AddComponentProvider,
  AddNgModuleImport,
  CoerceMethodClass,
  CoerceSourceFile,
  ToValueContext
} from '@rxap/schematics-ts-morph';
import { chain, externalSchematic, Rule } from '@angular-devkit/schematics';
import { join } from 'path';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(FeatureElement)
@ElementDef('with-popover-edit')
export class WithPopoverEditElement extends FeatureElement {

  @ElementChildTextContent()
  public form?: string;

  @ElementChildRawContent()
  public template?: string;

  public get formInterfaceName(): string {
    return `I${classify(this.id)}PopoverEditForm`;
  }

  public get formBaseModuleSpecifier(): string {
    return `./${dasherize(this.id)}-popover-edit-form`;
  }

  public get formInterfaceModuleSpecifier(): string {
    return `${this.formBaseModuleSpecifier}/${dasherize(this.id)}-popover-edit.form`;
  }

  public get formProviderModuleSpecifier(): string {
    return `${this.formBaseModuleSpecifier}/form.providers`;
  }

  public get formSubmitMethodName(): string {
    return `${classify(this.id)}PopoverEditSubmitMethod`;
  }

  public get formSubmitMethodModuleSpecifier(): string {
    return `./methods/${dasherize(this.id)}-popover-edit-submit.method`;
  }

  public tableTemplate(): string {
    return 'editable';
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(
      sourceFile,
      'PopoverEditFormDirectiveModule',
      '@rxap/material-popover-edit'
    );
  }

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    CoerceMethodClass(CoerceSourceFile(project, join(sourceFile.getDirectoryPath(), this.formSubmitMethodModuleSpecifier + '.ts')), this.formSubmitMethodName)
    AddComponentProvider(
      sourceFile,
      {
        provide: 'RXAP_POPOVER_EDIT_FORM_DEFINITION_BUILDER',
        useFactory: 'FormBuilderFactory',
        deps: [ 'INJECTOR' ]
      },
      [
        {
          namedImports: [ 'INJECTOR' ],
          moduleSpecifier: '@angular/core'
        },
        {
          namedImports: [ 'RXAP_POPOVER_EDIT_FORM_DEFINITION_BUILDER' ],
          moduleSpecifier: '@rxap/material-popover-edit'
        },
        {
          namedImports: [ 'FormBuilderFactory' ],
          moduleSpecifier: this.formProviderModuleSpecifier,
        },
      ]
    );
    AddComponentProvider(
      sourceFile,
      {
        provide: 'RXAP_POPOVER_EDIT_FORM_SUBMIT_METHOD',
        useClass: this.formSubmitMethodName,
      },
      [
        {
          namedImports: [ 'RXAP_POPOVER_EDIT_FORM_SUBMIT_METHOD' ],
          moduleSpecifier: '@rxap/material-popover-edit'
        },
        {
          namedImports: [ this.formSubmitMethodName ],
          moduleSpecifier: this.formSubmitMethodModuleSpecifier,
        }
      ]
    );
  }

  public toValue({ options }: ToValueContext): Rule {
    const name = dasherize(this.id) + '-popover-edit';
    return chain([
      externalSchematic('@rxap/schematics-form', 'generate', {
        path: options.path?.replace(/^\//, ''),
        name,
        template: this.template ?? join('forms', dasherize(this.form ?? name) + '.xml'),
        project: options.project,
        flat: false,
        organizeImports: false,
        fixImports: false,
        format: false,
        templateBasePath: options.templateBasePath,
        openApiModule: options.openApiModule,
        overwrite: options.overwrite,
        skipTsFiles: options.skipTsFiles,
      })
    ])
  }

}
