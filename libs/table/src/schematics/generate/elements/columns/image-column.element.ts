import { ColumnElement } from './column.element';
import { ElementAttribute, ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { WithTemplate } from '@rxap/schematics-html';
import { SourceFile } from 'ts-morph';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';

@ElementExtends(ColumnElement)
@ElementDef('image-column')
export class ImageColumnElement extends ColumnElement {

  @ElementAttribute()
  public preset?: string;

  public rowAttributeTemplate(): Array<string | (() => string)> {
    const attributes = [
      ...super.rowAttributeTemplate(),
      `[rxap-image-cell]="element${this.valueAccessor}"`
    ];

    if (this.preset) {
      attributes.push(`preset="${this.preset}"`);
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
      'ImageCellComponentModule',
      '@rxap/material-table-system'
    );
  }

}
