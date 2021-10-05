import { LeafFactory } from '@rxap/schematics-html';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { ElementAttribute, ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { NodeElement } from '../../node.element';
import { FormFieldElement } from './form-field.element';

@ElementExtends(NodeElement)
@ElementDef('input-control')
export class InputControlElement extends FormFieldElement {

  @ElementAttribute()
  public type?: string;

  public standalone?: boolean;

  public postParse() {
    if (!this.type) {
      const control = this.getControl();
      if (control) {
        switch (control.type?.name) {

          case 'number':
            this.type = 'number';
            break;

          case 'string':
            this.type = 'text';
            break;

          case 'boolean':
            this.type = 'checkbox';
            break;

        }
      }
    }
  }

  protected innerTemplate(): string {
    const attributes: Array<string | (() => string)> = [
      'matInput',
      `type="${this.type ?? 'text'}"`,
      `placeholder="Enter ${this.name}"`,
      'rxapRequired',
      `i18n-placeholder`,
      ...this.innerAttributes,
    ];

    if (!this.standalone) {
      attributes.push(`formControlName="${this.name}"`);
    }

    return LeafFactory('input', ...attributes);
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, 'MatInputModule', '@angular/material/input');
    AddNgModuleImport(sourceFile, 'RequiredDirectiveModule', '@rxap/material-form-system');
  }

}
