import { chain, Rule } from '@angular-devkit/schematics';
import { WithTemplate } from '@rxap/schematics-html';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { ParsedElement } from '@rxap/xml-parser';
import {
  ElementAttribute,
  ElementChildren,
  ElementDef,
  ElementExtends,
  ElementRequired,
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { ControlElement as DefinitionControlElement } from '../../../generate/elements/control.element';
import { FormElement as DefinitionFormElement } from '../../../generate/elements/form.element';
import { NodeElement } from '../node.element';
import { ControlFeatureElement } from './features/control-feature.element';

@ElementExtends(NodeElement)
@ElementDef('control')
export class ControlElement implements WithTemplate, ParsedElement, NodeElement {

  @ElementAttribute()
  @ElementRequired()
  public name!: string;

  @ElementAttribute()
  public flex: string = 'nogrow';

  @ElementChildren(ControlFeatureElement, { group: 'features' })
  public features?: ControlFeatureElement[];

  @ElementAttribute()
  public disabled?: boolean;

  public attributes: Array<string | (() => string)> = [];

  public __tag!: string;
  public __parent!: NodeElement;

  public nodes: NodeElement[] = [];

  public get controlPath(): string {
    return [ this.__parent.controlPath, this.name ].join('.');
  }

  public get formElement(): DefinitionFormElement | null {
    return this.__parent.formElement;
  }

  constructor() {
    this.flexTemplateAttribute = this.flexTemplateAttribute.bind(this);
  }

  public hasFeature(tag: string) {
    return !!this.features?.find(feature => feature.__tag === tag);
  }

  public getFeature<T extends ControlFeatureElement>(tag: string): T {
    const featureElement = this.features?.find(feature => feature.__tag === tag);
    if (!featureElement) {
      throw new Error(`Could not find feature '${tag}' for the control '${this.controlPath}'!`);
    }
    return featureElement as any;
  }

  protected flexTemplateAttribute(): string {
    return `fxFlex="${this.flex}"`;
  }

  public template(): string {
    return `
<!-- control ${this.name} -->
`;
  }

  public validate(): boolean {
    return true;
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    this.features?.forEach(feature => feature.handleComponent({ project, sourceFile, options }));
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    AddNgModuleImport(sourceFile, 'ReactiveFormsModule', '@angular/forms');
    AddNgModuleImport(sourceFile, 'FlexLayoutModule', '@angular/flex-layout');
    this.features?.forEach(feature => feature.handleComponentModule({ project, sourceFile, options }));
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return chain(this.features?.map(feature => feature.toValue({ project, options })) ?? []);
  }

  protected getControl(): DefinitionControlElement | null {
    const formElement   = this.formElement;
    const controlPath   = this.controlPath;
    const controlIdList = controlPath.split('.');
    controlIdList.shift(); // remove form id
    if (formElement) {
      return formElement.getControl(controlIdList.join('.'));
    }
    return null;
  }

}
