import { ParsedElement } from '@rxap/xml-parser';
import { ElementDef } from '@rxap/xml-parser/decorators';
import { ColumnMenuElement } from '../column-menu.element';
import { HandleComponentModule, ToValueContext } from '@rxap/schematics-ts-morph';
import { Rule } from '@angular-devkit/schematics';
import { SourceFile } from 'ts-morph';
import { DisplayColumn } from '../../feature.element';

@ElementDef('column-menu-feature')
export class ColumnMenuFeatureElement implements ParsedElement<Rule>, HandleComponentModule {

  public __tag!: string;
  public __parent!: ColumnMenuElement;

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
  }

  public toValue(context?: ToValueContext): Rule {
    return () => {
    };
  }

  public columnTemplate(): string {
    return '';
  }

  public headerTemplate(): string {
    return '';
  }

  public columnTemplateFilter(): string {
    return '';
  }

  public displayColumn(): DisplayColumn | DisplayColumn[] | null {
    return null;
  }

}
