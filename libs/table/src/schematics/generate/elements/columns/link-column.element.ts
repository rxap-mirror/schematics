import { ElementAttribute, ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { ColumnElement } from './column.element';
import { WithTemplate } from '@rxap/schematics-html';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(ColumnElement)
@ElementDef('link-column')
export class LinkColumnElement extends ColumnElement {

  @ElementAttribute()
  public protocol?: string;

  public rowAttributeTemplate(): Array<string | (() => string)> {
    const attributes = [
      ...super.rowAttributeTemplate(),
      `[rxap-link-cell]="element${this.valueAccessor}"`,
    ];

    if (this.protocol) {
      attributes.push(`protocol="${this.protocol}"`);
    }

    return attributes;
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
      'LinkCellComponentModule',
      '@rxap/material-table-system'
    );
  }
}
