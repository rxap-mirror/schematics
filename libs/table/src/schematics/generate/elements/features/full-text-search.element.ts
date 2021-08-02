import { FeatureElement } from './feature.element';
import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { AddComponentProvider, AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { SourceFile } from 'ts-morph';

@ElementExtends(FeatureElement)
@ElementDef('full-text-search')
export class FullTextSearchElement extends FeatureElement {

  public headerTemplate(): string {
    return `<mat-form-field style="width: 100%; margin-top: 8px" appearance="outline">
        <mat-label i18n>Search</mat-label>
        <input i18n-placeholder
               ngModel
               rxapTableFilterInput
               matInput
               placeholder="Enter the Search"
               type="text">
        <button mat-icon-button matSuffix rxapInputClearButton>
          <mat-icon>clear</mat-icon>
        </button>
      </mat-form-field>`
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'TableFullTextSearchModule', '@rxap/table-system');
    AddNgModuleImport(sourceFile, 'InputClearButtonDirectiveModule', '@rxap/material-form-system');
    AddNgModuleImport(sourceFile, 'MatInputModule', '@angular/material/input');
    AddNgModuleImport(sourceFile, 'MatButtonModule', '@angular/material/button');
    AddNgModuleImport(sourceFile, 'MatIconModule', '@angular/material/icon');
  }

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddComponentProvider(
      sourceFile,
      {
        provide: 'RXAP_TABLE_FILTER',
        useClass: 'TableFullTextSearchService'
      },
      [
        {
          namedImports: [ 'RXAP_TABLE_FILTER' ],
          moduleSpecifier: '@rxap/material-table-system'
        },
        {
          namedImports: [ 'TableFullTextSearchService' ],
          moduleSpecifier: '@rxap/table-system'
        }
      ]
    )
  }

}
