import { ControlFeatureElement } from './control-feature.element';
import { ElementAttribute, ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { SourceFile } from 'ts-morph';
import { NodeFactory } from '@rxap/schematics-html';

@ElementExtends(ControlFeatureElement)
@ElementDef('clear')
export class ClearElement extends ControlFeatureElement {

  @ElementAttribute()
  public stopPropagation?: boolean;

  public template(): string {
    const attributes: Array<string | (() => string)> = [ 'matSuffix', 'rxapInputClearButton', 'mat-icon-button', 'tabindex="-1"' ];
    if (this.stopPropagation) {
      attributes.push('rxapStopPropagation');
    }
    return NodeFactory('button', ...attributes)([
      NodeFactory('mat-icon')('clear')
    ]);
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    if (this.stopPropagation) {
      AddNgModuleImport(sourceFile, 'StopPropagationDirectiveModule', '@rxap/directives');
    }
    AddNgModuleImport(sourceFile, 'InputClearButtonDirectiveModule', '@rxap/material-form-system');
    AddNgModuleImport(sourceFile, 'MatIconModule', '@angular/material/icon');
    AddNgModuleImport(sourceFile, 'MatButtonModule', '@angular/material/button');
  }

}
