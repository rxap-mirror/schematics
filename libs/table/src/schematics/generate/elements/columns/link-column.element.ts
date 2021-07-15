import { ElementAttribute, ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { ColumnElement } from './column.element';
import { NodeFactory } from '@rxap/schematics-html';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(ColumnElement)
@ElementDef('link-column')
export class LinkColumnElement extends ColumnElement {

  @ElementAttribute()
  public protocol?: string;

  public template(): string {

    const headerAttributes: string[] = [
      'mat-header-cell',
      '*matHeaderCellDef'
    ];
    const rowAttributes: string[] = [
      'mat-cell',
      `[rxap-link-cell]="element${this.valueAccessor}"`,
      '*matCellDef="let element"'
    ];

    if (this.__parent.hasFeature('sort')) {
      headerAttributes.push('mat-sort-header')
    }
    if (this.protocol) {
      rowAttributes.push(`protocol="${this.protocol}"`);
    }

    return [
      NodeFactory('th', ...headerAttributes)(`<ng-container i18n>${capitalize(this.name)}</ng-container>`),
      NodeFactory('td', ...rowAttributes)(),
    ].join('\n');

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
