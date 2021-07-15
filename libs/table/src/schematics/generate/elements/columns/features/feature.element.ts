import { ParsedElement } from '@rxap/xml-parser';
import { SourceFile } from 'ts-morph';
import { ElementDef } from '@rxap/xml-parser/decorators';
import { HandleComponent, HandleComponentModule, ToValueContext } from '@rxap/schematics-ts-morph';
import { Rule } from '@angular-devkit/schematics';
import { ColumnElement } from '../column.element';

@ElementDef('feature')
export class FeatureElement implements ParsedElement<Rule>, HandleComponentModule, HandleComponent {

  public __tag!: string;
  public __parent!: ColumnElement;

  public get name() {
    return this.__parent.name;
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
  }

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
  }

  public toValue(context?: ToValueContext): Rule {
    return () => {
    };
  }

  public innerHeaderTemplate(): string {
    return '';
  }

  public innerRowTemplate(): string {
    return '';
  }

  public headerAttributeTemplate(): Array<string | (() => string)> {
    return [];
  }

  public rowAttributeTemplate(): Array<string | (() => string)> {
    return [];
  }

}
