import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import { AddNgModuleImport, HandleComponentModule, ToValueContext } from '@rxap/schematics-ts-morph';
import { SourceFile } from 'ts-morph';
import { Rule } from '@angular-devkit/schematics';
import { ColumnMenuFeatureElement } from './column-menu-feature.element';
import { ColumnMenuElement } from '../column-menu.element';
import {
  DisplayColumn,
  FeatureElement
} from '../../feature.element';

@ElementExtends(ColumnMenuFeatureElement)
@ElementDef('show-archived')
export class ColumnMenuShowArchivedElement implements ParsedElement<Rule>, HandleComponentModule {

  public __tag!: string;
  public __parent!: ColumnMenuElement;

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(
      sourceFile,
      'DateCellComponentModule',
      '@rxap/material-table-system'
    );
    AddNgModuleImport(
      sourceFile,
      'MatDividerModule',
      '@angular/material/divider'
    );
    AddNgModuleImport(
      sourceFile,
      'TableShowArchivedSlideComponentModule',
      '@digitaix/eurogard-table-system'
    );
  }

  public toValue(context?: ToValueContext): Rule {
    return () => {
    };
  }

  public columnTemplate(): string {
    return `
      <ng-container matColumnDef="removedAt">
        <th mat-header-cell *matHeaderCellDef>
          <ng-container i18n>Removed At</ng-container>
        </th>
        <td mat-cell [rxap-date-cell]="element.__removedAt" *matCellDef="let element"></td>
      </ng-container>
      `;
  }

  public headerTemplate(): string {
    return `
      <mat-divider></mat-divider>
      <span mat-menu-item>
        <eurogard-table-show-archived-slide [paginator]="paginator"></eurogard-table-show-archived-slide>
      </span>
      `;
  }

  public columnTemplateFilter(): string {
    return FeatureElement.ColumnNoFilter('removedAt');
  }

  public displayColumn(): DisplayColumn | null {
    return {
      name:   'removedAt',
      active: false,
      hidden: true,
    };
  }

}
