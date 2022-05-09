import { strings } from '@angular-devkit/core';
import { NodeFactory } from '@rxap/schematics-html';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { ElementChildren, ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { TableElement } from '../../table.element';
import { DisplayColumn, FeatureElement } from '../feature.element';
import { ColumnMenuFeatureElement } from './features/column-menu-feature.element';

export function coerceArray<T>(value?: T | T[] | null): T[] {
  return value === null || value === undefined ? [] : Array.isArray(value) ? value : [ value ];
}

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

  public displayColumn(): DisplayColumn | DisplayColumn[] | null {
    return this.features?.map(feature => feature.displayColumn())
               .filter((columns): columns is DisplayColumn[] | DisplayColumn => columns !== null)
               .reduce((displayColumns, columns) => [ ...coerceArray(displayColumns), ...coerceArray(columns) ], [] as DisplayColumn[]) ?? null;
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

    const columns = [
      ...(this.__parent.features?.map(feature => feature.displayColumn()) ?? []),
      ...this.__parent.columns.map((column) => column.displayColumn()),
    ].filter((column): column is DisplayColumn | DisplayColumn[] => !!column)
      .map(column => Array.isArray(column) ? column : [column])
      .reduce((a, b) => [...a, ...b], [])
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    for (const column of columns) {

      template +=
        NodeFactory(
          'rxap-table-column-option',
          ...[column.hidden ? 'hidden' : '', column.active === false ? 'inactive' : '', `name="${column.name}"`].filter(
            Boolean),
        )(
          [
            NodeFactory('ng-container', 'i18n')(capitalize(column.name)),
          ]);

    }

    this.features?.forEach(feature => template += feature.headerTemplate());
    template += '</rxap-table-column-menu>';
    return template;
  }
}
