import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { ColumnElement } from './column.element';
import { WithTemplate } from '@rxap/schematics-html';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(ColumnElement)
@ElementDef('copy-to-clipboard-column')
export class CopyToClipboardColumnElement extends ColumnElement {

  public rowAttributeTemplate(): Array<string | (() => string)> {
    return [ ...super.rowAttributeTemplate(),
      `[rxap-copy-to-clipboard-cell]="element${this.valueAccessor}"` ]
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
      'CopyToClipboardCellComponentModule',
      '@rxap/material-table-system'
    );
  }
}
