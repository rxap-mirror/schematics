import { strings } from '@angular-devkit/core';
import { chain, Rule } from '@angular-devkit/schematics';
import { NodeFactory } from '@rxap/schematics-html';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import {
  ElementAttribute,
  ElementChild,
  ElementChildren,
  ElementChildTextContent,
  ElementDef,
  ElementExtends,
  ElementRequired,
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { FormElement as DefinitionFormElement } from '../../generate/elements/form.element';
import { NodeElement } from './node.element';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementDef('content')
export class PanelContentElement extends NodeElement {

  public template(): string {
    return this.nodes.map(node => node.template()).join('\n');
  }

}

@ElementDef('panel')
export class PanelElement implements NodeElement {

  @ElementChildTextContent()
  @ElementRequired()
  public title!: string;

  @ElementChild(PanelContentElement)
  @ElementRequired()
  public content!: PanelContentElement;

  @ElementAttribute()
  public expanded!: boolean;

  public __parent!: NodeElement;
  public __tag!: string;
  public nodes!: NodeElement[];

  public get controlPath(): string {
    return this.__parent.controlPath;
  }

  public get formElement(): DefinitionFormElement | null {
    return this.__parent.formElement;
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return this.content.toValue({ project, options });
  }

  public template(): string {
    const attributes: string[] = [];
    if (this.expanded) {
      attributes.push('expanded');
    }
    return NodeFactory('mat-expansion-panel', ...attributes)([
      NodeFactory('mat-expansion-panel-header')(
        NodeFactory('mat-panel-title')(this.title),
      ),
      NodeFactory('ng-template', 'matExpansionPanelContent')([ this.content ]),
    ]);
  }

  public handleComponentModule({ project, options, sourceFile }: ToValueContext & { sourceFile: SourceFile }) {
    this.content.handleComponentModule({ project, options, sourceFile });
  }

  public handleComponent({ project, options, sourceFile }: ToValueContext & { sourceFile: SourceFile }) {
    this.content.handleComponent({ project, options, sourceFile });
  }

  public validate(): boolean {
    return true;
  }

}

@ElementExtends(NodeElement)
@ElementDef('accordion')
export class AccordionElement implements NodeElement {

  @ElementChildren(PanelElement)
  @ElementRequired()
  public panels!: PanelElement[];

  @ElementAttribute()
  public flex: string = 'nogrow';

  @ElementAttribute()
  public multiple: boolean = true;

  public __parent!: NodeElement;

  public __tag!: string;
  public nodes!: NodeElement[];

  public get controlPath(): string {
    return this.__parent.controlPath;
  }

  public get formElement(): DefinitionFormElement | null {
    return this.__parent.formElement;
  }

  public template(): string {
    const attributes: Array<string | (() => string)> = [`fxFlex="${this.flex}"`];
    if (this.multiple) {
      attributes.push('multi');
    }
    return NodeFactory('mat-accordion', ...attributes)(this.panels);
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    this.panels.forEach(panel => panel.handleComponent({ project, sourceFile, options }));
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    AddNgModuleImport(sourceFile, 'MatExpansionModule', '@angular/material/expansion');
    this.panels.forEach(panel => panel.handleComponentModule({ project, sourceFile, options }));
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return chain(this.panels.map(panel => panel.toValue({ project, options })));
  }

  public validate(): boolean {
    return !!this.panels.length;
  }

}
