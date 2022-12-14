import { ElementAttribute, ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { ColumnElement } from './column.element';
import { TypeElement } from '@rxap/schematics-xml-parser';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { WithTemplate } from '@rxap/schematics-html';
import { ElementFactory } from '@rxap/xml-parser';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(ColumnElement)
@ElementDef('date-column')
export class DateColumnElement extends ColumnElement {

  public postParse() {
    if (!this.type) {
      this.type = ElementFactory<TypeElement>(TypeElement, { name: 'string | number | Date' });
    }
  }

  @ElementAttribute({
    defaultValue: 'dd.MM.yyyy HH:mm:ss'
  })
  format?: string;

  public rowAttributeTemplate(): Array<string | (() => string)> {
    return [
      ...super.rowAttributeTemplate(),
      `[rxap-date-cell]="element${this.valueAccessor}"`,
      `format="${this.format}"`
    ]
  }

  public innerRowTemplate(): Array<Partial<WithTemplate> | string> {
    return []
  }

  public templateFilter(): string {
    return `
      <th mat-header-cell *matHeaderCellDef>
        <mat-form-field rxapNoPadding>
          <mat-label i18n>${capitalize(this.name)}</mat-label>
          <input matInput [matDatepicker]="picker" parentControlContainer formControlName="${camelize(
            this.name
          )}">
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>
    </th>
    `;
  }

  public handleComponentModule({
    sourceFile,
    project,
    options,
  }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ sourceFile, project, options });

    if (this.filter) {
      AddNgModuleImport(
        sourceFile,
        'MatDatepickerModule',
        '@angular/material/datepicker'
      );
      AddNgModuleImport(
        sourceFile,
        'FormFieldNoPaddingModule',
        '@rxap/material-directives/form-field'
      );
    }
    AddNgModuleImport(
      sourceFile,
      'DateCellComponentModule',
      '@rxap/material-table-system'
    );
  }
}
