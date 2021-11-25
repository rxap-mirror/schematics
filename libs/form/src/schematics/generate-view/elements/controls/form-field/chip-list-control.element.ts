import {
  ElementExtends,
  ElementDef
} from '@rxap/xml-parser/decorators';
import { NodeElement } from '../../node.element';
import {
  LeafFactory,
  NodeFactory
} from '@rxap/schematics-html';
import { FormFieldElement } from './form-field.element';
import {
  ToValueContext,
  AddNgModuleImport
} from '@rxap/schematics-ts-morph';
import { SourceFile } from 'ts-morph';

@ElementExtends(NodeElement)
@ElementDef('chip-list-control')
export class ChipListControlElement extends FormFieldElement {


  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, 'ChipInputAdapterDirectiveModule', '@rxap/material-form-system');
    AddNgModuleImport(sourceFile, 'ChipListIteratorDirectiveModule', '@rxap/material-form-system');
    AddNgModuleImport(sourceFile, 'MatChipsModule', '@angular/material/chips');
    AddNgModuleImport(sourceFile, 'MatIconModule', '@angular/material/icon');
  }

  protected innerTemplate(): string {

    const exportName = `${this.name}ChipList`

    return NodeFactory('mat-chip-list', `#${exportName}`, `formControlName="${this.name}"`)([
      NodeFactory(
        'mat-chip',
        '(removed)="onRemoved($event)"',
        '*rxapChipListIterator="let tag; let onRemoved = onRemoved"',
        '[removable]="true"',
        '[value]="tag"'
      )([
        '{{tag}}',
        NodeFactory('mat-icon', 'matChipRemove')('cancel')
      ]),
      LeafFactory(
        'input',
        `[matChipInputFor]="${exportName}"`,
        `placeholder="Enter ${this.name} separated by comma"`,
        `i18n-placeholder`,
        'rxapChipInputAdapter'
      )
    ]);

  }


}
