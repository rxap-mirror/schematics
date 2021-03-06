import { Rule } from '@angular-devkit/schematics';
import {
  HandleComponent,
  HandleComponentModule,
  ToValueContext
} from '@rxap/schematics-ts-morph';
import { ParsedElement } from '@rxap/xml-parser';
import { ElementDef } from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { TableElement } from '../table.element';

export interface DisplayColumn {
  name: string;
  hidden?: boolean;
  active?: boolean;
  order?: number;
}

@ElementDef('feature')
export class FeatureElement implements ParsedElement<Rule>, HandleComponentModule, HandleComponent {

  public __tag!: string;
  public __parent!: TableElement;

  public get id(): string {
    return this.__parent.id;
  }

  public static ColumnNoFilter(name: string, sticky: boolean = false, stickyEnd: boolean = false): string {
    return `
    <ng-container matColumnDef="filter_${name}" ${sticky ? 'sticky' : ''} ${stickyEnd ? 'stickyEnd' : ''}>
      <th mat-header-cell *matHeaderCellDef></th>
    </ng-container>
    `;
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
  }

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
  }

  public toValue(context?: ToValueContext): Rule {
    return () => {};
  }

  public displayColumn(): DisplayColumn | DisplayColumn[] | null {
    return null;
  }

  public columnTemplate(): string {
    return '';
  }

  public columnTemplateFilter(): string {
    return '';
  }

  public footerTemplate(): string {
    return '';
  }

  public headerTemplate(): string {
    return '';
  }

  public tableTemplate(): string {
    return '';
  }

}
