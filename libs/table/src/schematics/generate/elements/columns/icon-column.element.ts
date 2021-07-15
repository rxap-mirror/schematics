import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { strings } from '@angular-devkit/core';
import { SourceFile } from 'ts-morph';
import { ColumnElement } from './column.element';
import { WithTemplate } from '@rxap/schematics-html';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(ColumnElement)
@ElementDef('icon-column')
export class IconColumnElement extends ColumnElement {

  public rowAttributeTemplate(): Array<string | (() => string)> {
    return [ ...super.rowAttributeTemplate(),
      `[rxap-icon-cell]="element${this.valueAccessor}"` ]
  }

  public innerRowTemplate(): Array<Partial<WithTemplate> | string> {
    return []
  }

  public handleComponentModule({
                                 sourceFile,
                                 project,
                                 options,
                               }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ sourceFile, project, options });
    AddNgModuleImport(
      sourceFile,
      'IconCellComponentModule',
      '@rxap/material-table-system'
    );
  }
}
