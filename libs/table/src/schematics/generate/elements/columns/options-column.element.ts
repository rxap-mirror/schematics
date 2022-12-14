import { ElementChild, ElementDef, ElementExtends, } from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { OptionsElement } from '@rxap/xml-parser/elements';
import { ElementFactory } from '@rxap/xml-parser';
import { ColumnElement } from './column.element';
import { FilterElement } from './filters/filter.element';
import { NodeFactory, WithTemplate } from '@rxap/schematics-html';
import { SchematicsException } from '@angular-devkit/schematics';
import { TypeElement } from '@rxap/schematics-xml-parser';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(ColumnElement)
@ElementDef('options-column')
export class OptionsColumnElement extends ColumnElement {
  @ElementChild(OptionsElement)
  public options!: OptionsElement;

  public rowAttributeTemplate(): Array<string | (() => string)> {
    return [ ...super.rowAttributeTemplate(),
      `[rxap-options-cell]="element${this.valueAccessor}"`, ]
  }

  public innerRowTemplate(): Array<Partial<WithTemplate> | string> {

    if (!this.options.options) {
      throw new SchematicsException('The options-column has not any defined option');
    }

    return this.options.options.map((option) =>
      NodeFactory(
        'mat-option',
        typeof option.value === 'string'
          ? `value="${option.value}"`
          : `[value]="${option.value}"`
      )(option.display)
    );
  }

  public postParse() {
    if (this.filter) {
      this.filter = ElementFactory<FilterElement>(FilterElement, {});
    }
    if (!this.type) {
      this.type = ElementFactory<TypeElement>(TypeElement, { name: 'string | number' });
    }
  }

  public handleComponentModule({
    sourceFile,
    project,
    options,
  }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ sourceFile, project, options });
    // TODO : mv DateCellComponentModule to rxap
    AddNgModuleImport(
      sourceFile,
      'OptionsCellComponentModule',
      '@rxap/material-table-system'
    );
    AddNgModuleImport(
      sourceFile,
      'MatSelectModule',
      '@angular/material/select'
    );
  }
}
