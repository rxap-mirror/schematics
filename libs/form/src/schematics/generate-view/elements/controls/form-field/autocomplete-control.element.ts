import { FormFieldElement } from './form-field.element';
import {
  ElementChildTextContent,
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { NodeElement } from '../../node.element';
import {
  AddNgModuleImport,
  ToValueContext
} from '@rxap/schematics-ts-morph';
import { SourceFile } from 'ts-morph';
import type { ClearElement } from '../features/clear.element';
import {
  NodeFactory,
  LeafFactory
} from '@rxap/schematics-html';

@ElementExtends(NodeElement)
@ElementDef('autocomplete-control')
export class AutocompleteControlElement extends FormFieldElement {

  @ElementChildTextContent()
  public compareWith?: string;

  public postParse() {
    const clearFeature: ClearElement | undefined = this.features?.find(feature => feature.__tag === 'clear');
    if (clearFeature) {
      clearFeature.stopPropagation = true;
    }
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, 'CompareWithDirectiveModule', '@rxap/material-form-system');
    AddNgModuleImport(sourceFile, 'MatSelectModule', '@angular/material/select');
    AddNgModuleImport(sourceFile, 'InputSelectOptionsDirectiveModule', '@rxap/form-system');
    AddNgModuleImport(sourceFile, 'RequiredDirectiveModule', '@rxap/material-form-system');
  }

  protected innerTemplate(): string {
    return [
      LeafFactory(
        'input',
        'type="text"',
        'rxapRequired',
        `formControlName="${this.name}"`,
        `i18n-placeholder`,
        `placeholder="Enter ${this.name}"`,
        'matInput',
        '[matAutocomplete]="auto"',
        ...this.innerAttributes
      ),
      NodeFactory('mat-autocomplete', '#auto="matAutocomplete"')([
        NodeFactory('mat-option', '*rxapInputSelectOptions="let option; matAutocomplete: auto"', '[value]="option.value"')('\n{{option.display}}\n')
      ]),
    ].join('\n');
  }

}
