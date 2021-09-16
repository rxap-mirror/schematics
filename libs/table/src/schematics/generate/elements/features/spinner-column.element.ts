import { NodeFactory } from '@rxap/schematics-html';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { DisplayColumn, FeatureElement } from './feature.element';

@ElementExtends(FeatureElement)
@ElementDef('spinner-column')
export class SpinnerColumnElement extends FeatureElement {

  public displayColumn(): DisplayColumn | DisplayColumn[] | null {
    return {
      name:   '__spinner__',
      hidden: true,
      active: true,
      order:  -1,
    };
  }

  public columnTemplate(): string {
    return NodeFactory('ng-container', 'matColumnDef="__spinner__"')([
      NodeFactory('th', 'mat-header-cell', '*matHeaderCellDef')(),
      NodeFactory('td', 'mat-cell', '*matCellDef="let element"')([
        NodeFactory('mat-spinner', '*ngIf="element.__metadata__?.loading$ | async"', 'diameter="15"')(),
      ]),
    ]);
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'CommonModule', '@angular/common');
    AddNgModuleImport(sourceFile, 'MatProgressSpinnerModule', '@angular/material/progress-spinner');
  }

}
