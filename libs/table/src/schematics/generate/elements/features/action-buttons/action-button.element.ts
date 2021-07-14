import {
  ElementAttribute,
  ElementChildTextContent,
  ElementDef,
  ElementExtends,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import { SourceFile } from 'ts-morph';
import { HandleComponent, HandleComponentModule, ToValueContext } from '@rxap/schematics-ts-morph';
import { Rule } from '@angular-devkit/schematics';
import { ActionButtonsElement } from './action-buttons.element';
import { NodeFactory, StringOrFactory, WithTemplate } from '@rxap/schematics-html';

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

@ElementExtends(AbstractActionButtonElement)
@ElementDef('action')
export class ActionButtonElement extends AbstractActionButtonElement {

  @ElementChildTextContent()
  @ElementRequired()
  public type!: string;

  @ElementChildTextContent()
  @ElementRequired()
  public icon!: string;

  @ElementChildTextContent()
  public tooltip!: string;

  @ElementAttribute()
  public confirm!: boolean;

  @ElementChildTextContent()
  public color!: string;

  @ElementAttribute()
  public header!: boolean;

  public template(): string {
    const attributes: string[] = [
      `rxapTableRowAction="${this.type}"`,
      '[element]="element"',
      'mat-icon-button'
    ];
    if (this.color) {
      attributes.push(`color="${this.color}"`);
    }
    if (this.tooltip) {
      attributes.push(`matTooltip="${this.tooltip}"`);
      attributes.push('i18n-matTooltip');
    }
    if (this.confirm) {
      attributes.push('rxapConfirm');
    }
    return NodeFactory('button', ...attributes)([
      NodeFactory('mat-icon')(this.icon),
      NodeFactory('mat-progress-bar', '*rxapTableRowActionExecuting', 'mode="indeterminate"')()
    ]);
  }

  public templateHeader(): string {
    if (!this.header) {
      return '';
    }
    const attributes: string[] = [
      `rxapTableRowHeaderAction="${this.type}"`,
      'mat-icon-button'
    ];
    if (this.color) {
      attributes.push(`color="${this.color}"`);
    }
    if (this.tooltip) {
      attributes.push(`matTooltip="${this.tooltip}"`);
      attributes.push('i18n-matTooltip');
    }
    if (this.confirm) {
      attributes.push('rxapConfirm');
    }
    return NodeFactory('button', ...attributes)([
      NodeFactory('mat-icon')(this.icon),
      NodeFactory('mat-progress-bar', '*rxapTableRowActionExecuting', 'mode="indeterminate"')()
    ]);
  }

}
