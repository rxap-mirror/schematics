import { ElementDef } from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import { Rule } from '@angular-devkit/schematics';
import { ActionButtonsElement } from './action-buttons.element';
import { SourceFile } from 'ts-morph';
import { HandleComponent, HandleComponentModule, ToValueContext } from '@rxap/schematics-ts-morph';
import { StringOrFactory, WithTemplate } from '@rxap/schematics-html';

@ElementDef('abstract-action')
export class AbstractActionButtonElement implements ParsedElement<Rule>, HandleComponentModule, HandleComponent, WithTemplate {

  public __parent!: ActionButtonsElement;
  public __tag!: string;

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
  }

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return () => {
    };
  }

  public template(...attributes: StringOrFactory[]): string {
    return '';
  }

}
