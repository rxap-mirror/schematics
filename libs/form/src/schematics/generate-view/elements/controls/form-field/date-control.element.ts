import {
  LeafFactory,
  NodeFactory
} from '@rxap/schematics-html';
import {
  AddNgModuleImport,
  ToValueContext
} from '@rxap/schematics-ts-morph';
import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { NodeElement } from '../../node.element';
import { FormFieldElement } from './form-field.element';
import { strings } from '@angular-devkit/core';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(NodeElement)
@ElementDef('date-control')
export class DateControlElement extends FormFieldElement {

  public standalone?: boolean;

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, 'MatDatepickerModule', '@angular/material/datepicker');
    AddNgModuleImport(sourceFile, 'MatInputModule', '@angular/material/input');
    AddNgModuleImport(sourceFile, 'RequiredDirectiveModule', '@rxap/material-form-system');
  }

  protected innerTemplate(): string {
    const attributes: Array<string | (() => string)> = [
      'matInput',
      'rxapRequired',
      ...this.innerAttributes,
    ];

    if (!this.standalone) {
      attributes.push(`formControlName="${this.name}"`);
    }

    const dataPickerName = camelize([this.name, 'picker'].join('-'));

    return [
      LeafFactory('input', `[matDatepicker]="${dataPickerName}"`, ...attributes),
      NodeFactory('mat-datepicker-toggle', 'matSuffix', `[for]="${dataPickerName}"`)(),
      NodeFactory('mat-datepicker', `#${dataPickerName}`)()
    ].join('\n');
  }

}
