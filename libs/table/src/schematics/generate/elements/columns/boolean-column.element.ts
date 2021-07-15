import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { ColumnElement } from './column.element';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { WithTemplate } from '@rxap/schematics-html';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(ColumnElement)
@ElementDef('boolean-column')
export class BooleanColumnElement extends ColumnElement {

  public rowAttributeTemplate(): Array<string | (() => string)> {
    return [
      ...super.rowAttributeTemplate(),
      `[rxap-boolean-cell]="element${this.valueAccessor}"`
    ]
  }

  public innerRowTemplate(): Array<Partial<WithTemplate> | string> {
    return []
  }

  public templateFilter(): string {
    return `
      <th mat-header-cell *matHeaderCellDef>
        <mat-checkbox indeterminate parentControlContainer
                      formControlName="${camelize(this.name)}">
          <ng-container i18n>${capitalize(this.name)}</ng-container>
        </mat-checkbox>
      </th>`;
  }

  public handleComponentModule({
    sourceFile,
    project,
    options,
  }: ToValueContext & { sourceFile: SourceFile }) {
    if (this.filter) {
      AddNgModuleImport(
        sourceFile,
        'MatCheckboxModule',
        '@angular/material/checkbox'
      );
    }
    // TODO : mv BooleanCellComponentModule to rxap
    AddNgModuleImport(
      sourceFile,
      'BooleanCellComponentModule',
      '@rxap/material-table-system'
    );
  }
}
