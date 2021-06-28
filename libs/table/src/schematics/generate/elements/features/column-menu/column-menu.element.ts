import { ElementChildren, ElementDef, ElementExtends, } from '@rxap/xml-parser/decorators';
import { DisplayColumn, FeatureElement } from '../feature.element';
import { SourceFile } from 'ts-morph';
import { TableElement } from '../../table.element';
import { strings } from '@angular-devkit/core';
import { coerceArray } from '@rxap/utilities';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { ColumnMenuFeatureElement } from './features/column-menu-feature.element';

const { capitalize } = strings;

@ElementExtends(FeatureElement)
@ElementDef('column-menu')
export class ColumnMenuElement extends FeatureElement {
  public __parent!: TableElement;

  @ElementChildren(ColumnMenuFeatureElement, { group: 'features' })
  public features?: ColumnMenuFeatureElement[];

  public handleComponentModule({
                                 sourceFile,
                                 project,
                                 options,
                               }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(
      sourceFile,
      'TableColumnMenuComponentModule',
      '@rxap/material-table-system'
    );
    this.features?.forEach(feature => feature.handleComponentModule({
      sourceFile,
      project,
      options,
    }));
  }

  public displayColumn(): DisplayColumn | null {
    return {
      name: 'removedAt',
      active: false,
      hidden: true,
    };
  }

  public columnTemplateFilter(): string {
    return [
      ...(this.features ?? []).map(feature => feature.columnTemplateFilter()),
      super.columnTemplateFilter()
    ].filter(Boolean).join('\n');
  }

  public columnTemplate(): string {
    return [
      ...(this.features ?? []).map(feature => feature.columnTemplate()),
      super.columnTemplate()
    ].filter(Boolean).join('\n');
  }

  public headerTemplate(): string {
    let template =
      '<rxap-table-column-menu matCard #rxapTableColumns="rxapTableColumns">';

    if (this.__parent.features) {
      for (const feature of this.__parent.features) {
        const displayColumns = coerceArray(feature.displayColumn());
        for (const displayColumn of displayColumns) {
          template += `
        <rxap-table-column-option
        ${displayColumn.hidden ? 'hidden' : ''}
        ${displayColumn.active === false ? 'inactive' : ''}
        name="${displayColumn.name}">
        </rxap-table-column-option>
        `;
        }
      }
    }

    for (const column of this.__parent.columns) {
      const displayColumns = coerceArray(column.displayColumn());
      for (const displayColumn of displayColumns) {
        template += `
        <rxap-table-column-option
        ${displayColumn.hidden ? 'hidden' : ''}
        ${displayColumn.active === false ? 'inactive' : ''}
        name="${displayColumn.name}">
        <ng-container i18n>${capitalize(displayColumn.name)}</ng-container>
        </rxap-table-column-option>
        `;
      }
    }

    this.features?.forEach(feature => template += feature.headerTemplate())
    template += '</rxap-table-column-menu>';
    return template;
  }
}
