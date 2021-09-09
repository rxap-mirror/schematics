import { Rule } from '@angular-devkit/schematics';
import { NodeFactory, StringOrFactory, WithTemplate } from '@rxap/schematics-html';
import { AddNgModuleImport, HandleComponent, HandleComponentModule, ToValueContext } from '@rxap/schematics-ts-morph';
import { ParsedElement } from '@rxap/xml-parser';
import {
  ElementAttribute,
  ElementChild,
  ElementChildTextContent,
  ElementDef,
  ElementExtends,
  ElementRequired,
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { FormElement as DefinitionFormElement } from '../../generate/elements/form.element';
import { NodeElement } from './node.element';

@ElementDef('content')
export class ContentElement extends NodeElement {
  public template(): string {
    return NodeFactory('mat-card-content')(this.nodes);
  }
}

@ElementExtends(NodeElement)
@ElementDef('card')
export class CardElement
  implements WithTemplate,
    ParsedElement<Rule>,
    HandleComponentModule,
    HandleComponent,
    NodeElement {
  public __tag!: string;
  public __parent!: NodeElement;

  public nodes: NodeElement[] = [];

  public get controlPath(): string {
    return this.__parent.controlPath;
  }

  public get formElement(): DefinitionFormElement | null {
    return this.__parent.formElement;
  }

  @ElementAttribute()
  public flex: string = 'nogrow';

  @ElementChildTextContent()
  public title?: string;

  @ElementChild(ContentElement)
  @ElementRequired()
  public content!: ContentElement;

  public template(...attributes: StringOrFactory[]): string {
    const nodes: Array<string | WithTemplate> = [];

    if (this.title) {
      nodes.push(NodeFactory('mat-card-title', `i18n`)(this.title));
    }

    nodes.push(this.content);

    return NodeFactory('mat-card', `fxFlex="${this.flex}"`)(nodes);
  }

  public handleComponent({
    project,
    sourceFile,
    options,
  }: ToValueContext & { sourceFile: SourceFile }): void {
    this.content.handleComponent({ project, options, sourceFile });
  }

  public handleComponentModule({
    project,
    sourceFile,
    options,
  }: ToValueContext & { sourceFile: SourceFile }): void {
    AddNgModuleImport(sourceFile, 'MatCardModule', '@angular/material/card');
    this.content.handleComponentModule({ project, options, sourceFile });
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return this.content.toValue({ project, options });
  }

  public validate(): boolean {
    return true;
  }
}
