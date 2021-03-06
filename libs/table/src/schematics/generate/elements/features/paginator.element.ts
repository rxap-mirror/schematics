import { FeatureElement } from './feature.element';
import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import {
  AddNgModuleImport,
  ToValueContext
} from '@rxap/schematics-ts-morph';

@ElementExtends(FeatureElement)
@ElementDef('paginator')
export class PaginatorElement extends FeatureElement {

  public footerTemplate(): string {
    return '<mat-paginator rxapPersistent [pageSizeOptions]="[5, 10, 25, 50, 75, 100, 150, 200]" [pageSize]="10" #paginator="matPaginator"></mat-paginator>';
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'MatPaginatorModule', '@angular/material/paginator');
    AddNgModuleImport(sourceFile, 'PersistentPaginatorDirectiveModule', '@rxap/material-table-system');
  }

  public tableTemplate(): string {
    return '[paginator]="paginator"';
  }

}
