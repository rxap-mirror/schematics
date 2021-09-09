import { chain, Rule } from '@angular-devkit/schematics';
import { NodeFactory } from '@rxap/schematics-html';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import {
  ElementAttribute,
  ElementChildren,
  ElementDef,
  ElementExtends,
  ElementRequired,
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { FormElement as DefinitionFormElement } from '../../generate/elements/form.element';
import { NodeElement } from './node.element';

@ElementExtends(NodeElement)
@ElementDef('group')
export class GroupElement implements NodeElement {

  public __tag!: string;
  public __parent!: NodeElement;

  @ElementAttribute()
  @ElementRequired()
  public name!: string;

  @ElementChildren(NodeElement, { group: 'nodes' })
  public nodes: NodeElement[] = [];

  public get controlPath(): string {
    return [this.__parent.controlPath, this.name].join('.');
  }

  public get formElement(): DefinitionFormElement | null {
    return this.__parent.formElement;
  }

  public template(): string {
    return NodeFactory('ng-container', `formGroupName="${this.name}"`)(this.nodes);
  }

  public validate(): boolean {
    return this.nodes && this.nodes.length !== 0;
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return chain(this.nodes.map(node => node.toValue({ project, options })));
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    this.nodes.forEach(node => node.handleComponent({ project, sourceFile, options }));
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    this.nodes.forEach(node => node.handleComponentModule({ project, sourceFile, options }));
    AddNgModuleImport(sourceFile, 'ReactiveFormsModule', '@angular/forms');
  }

}
