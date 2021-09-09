import { chain, Rule } from '@angular-devkit/schematics';
import { NodeFactory, StringOrFactory, WithTemplate } from '@rxap/schematics-html';
import { AddNgModuleImport, HandleComponent, HandleComponentModule, ToValueContext } from '@rxap/schematics-ts-morph';
import { ParsedElement } from '@rxap/xml-parser';
import {
  ElementChildren,
  ElementChildTextContent,
  ElementDef,
  ElementExtends,
  ElementRequired,
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { FormElement as DefinitionFormElement } from '../../generate/elements/form.element';
import { NodeElement } from './node.element';

@ElementDef('tab')
export class TabElement implements NodeElement {

  public __tag!: string;
  public __parent!: TabGroupElement;

  @ElementChildTextContent()
  @ElementRequired()
  public label!: string;

  @ElementChildren(NodeElement, { group: 'nodes' })
  public nodes: NodeElement[] = [];

  public get controlPath(): string {
    return this.__parent.controlPath;
  }

  public get formElement(): DefinitionFormElement | null {
    return this.__parent.formElement;
  }

  public template(): string {
    return NodeFactory('mat-tab', `label="${this.label}"`)(NodeFactory(
      'ng-template', 'matTabContent',
    )([...this.nodes, '\n']));
  }

  public validate(): boolean {
    return this.nodes && this.nodes.length !== 0;
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    this.nodes.forEach(node => node.handleComponent({ project, options, sourceFile }));
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    AddNgModuleImport(sourceFile, 'MatTabsModule', '@angular/material/tabs');
    this.nodes.forEach(node => node.handleComponentModule({ project, options, sourceFile }));
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return chain(this.nodes.map(node => node.toValue({ project, options })));
  }

}

@ElementExtends(NodeElement)
@ElementDef('tab-group')
export class TabGroupElement implements WithTemplate, ParsedElement<Rule>, HandleComponentModule, HandleComponent, NodeElement {

  public __tag!: string;
  public __parent!: NodeElement;

  public nodes: NodeElement[] = [];

  @ElementChildren(TabElement)
  public tabs!: TabElement[];

  public get controlPath(): string {
    return this.__parent.controlPath;
  }

  public get formElement(): DefinitionFormElement | null {
    return this.__parent.formElement;
  }

  public validate(): boolean {
    return this.tabs && this.tabs.length !== 0;
  }

  public template(...attributes: StringOrFactory[]): string {
    return NodeFactory('mat-tab-group')(this.tabs);
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    this.tabs.forEach(tab => tab.handleComponent({ project, options, sourceFile }));
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    AddNgModuleImport(sourceFile, 'MatTabsModule', '@angular/material/tabs');
    this.tabs.forEach(tab => tab.handleComponentModule({ project, sourceFile, options }));
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return chain(this.tabs.map(tab => tab.toValue({ project, options })));
  }

}
