import { FormFieldElement } from './form-field.element';
import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { NodeElement } from '../../node.element';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { NodeFactory } from '@rxap/schematics-html';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(NodeElement)
@ElementDef('textarea-control')
export class TextareaControlElement extends FormFieldElement {

  protected innerTemplate(): string {
    return NodeFactory(
      'textarea',
      'matInput',
      'cdkTextareaAutosize',
      '[cdkAutosizeMinRows]="3"',
      `formControlName="${this.name}"`,
      'rxapRequired',
      `placeholder="Enter ${this.name}"`,
      `i18n-placeholder`,
      ...this.innerAttributes
    )('\n');
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, 'MatInputModule', '@angular/material/input');
    AddNgModuleImport(sourceFile, 'RequiredDirectiveModule', '@rxap/material-form-system');
    AddNgModuleImport(sourceFile, 'TextFieldModule', '@angular/cdk/text-field');
  }

}
