import { strings } from '@angular-devkit/core';
import { NodeFactory, WithTemplate } from '@rxap/schematics-html';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { ElementChild, ElementChildTextContent } from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import { ControlElement } from '../control.element';
import { ErrorsElement } from '../errors.element';
import { PermissionsElement } from '../features/permissions.element';
import { PrefixElement, SuffixElement } from './prefix.element';

const { dasherize, classify, camelize, capitalize } = strings;

export abstract class FormFieldElement extends ControlElement {
  @ElementChildTextContent()
  public label?: string;

  @ElementChild(PrefixElement)
  public prefix?: PrefixElement;

  @ElementChild(SuffixElement)
  public suffix?: SuffixElement;

  @ElementChildTextContent()
  public hint?: string;

  @ElementChild(ErrorsElement)
  public errors?: ErrorsElement;

  public innerAttributes: Array<string | (() => string)> = [];

  public template(...attributes: Array<string | (() => string)>): string {
    if (this.hasFeature('permissions')) {
      const permissionsElement =
        this.getFeature<PermissionsElement>('permissions');
      this.innerAttributes.push(
        ...permissionsElement.getAttributes(
          ['form', this.controlPath].join('.')
        )
      );
    }
    const nodes: Array<WithTemplate | string> = [
      NodeFactory('mat-label', `i18n`)(this.label ?? capitalize(this.name)),
      this.innerTemplate(),
    ];
    if (this.suffix) {
      nodes.push(this.suffix?.template());
    }
    if (this.prefix) {
      nodes.push(this.prefix?.template());
    }
    if (this.hint) {
      nodes.push(NodeFactory('mat-hint')(this.hint));
    }
    this.autoCreateErrors();
    if (this.errors) {
      nodes.push(this.errors.template());
    }
    if (this.features) {
      nodes.push(...this.features);
    }
    attributes.push(`data-cy="form.${this.controlPath}"`);

    let node = NodeFactory(
      'mat-form-field',
      this.flexTemplateAttribute,
      ...this.attributes,
      ...attributes
    )(nodes);

    if (this.hasFeature('permissions')) {
      const permissionsElement =
              this.getFeature<PermissionsElement>('permissions');
      node                     = permissionsElement.wrapNode(
        node,
        ['form', this.controlPath].join('.'),
      );
    }

    return node;
  }

  private autoCreateErrors() {
    const control = this.getControl();
    if (control) {
      if (!this.errors) {
        this.errors = new ErrorsElement();
      }
      if (control.required && !this.errors.errors.required) {
        this.errors.errors.required = 'Please enter a value';
      }
      if (!this.errors.validate()) {
        this.errors = undefined;
      }
    } else {
      console.warn('Could not find control');
    }
  }

  protected abstract innerTemplate(): string;

  public handleComponentModule({
    project,
    sourceFile,
    options,
  }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(
      sourceFile,
      'MatFormFieldModule',
      '@angular/material/form-field'
    );
    this.suffix?.handleComponentModule({ project, sourceFile, options });
    this.prefix?.handleComponentModule({ project, sourceFile, options });
    this.errors?.handleComponentModule({ project, sourceFile, options });
  }

  handleComponent({
    project,
    sourceFile,
    options,
  }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponent({ project, sourceFile, options });
    this.suffix?.handleComponent({ project, sourceFile, options });
    this.prefix?.handleComponent({ project, sourceFile, options });
    this.errors?.handleComponent({ project, sourceFile, options });
  }
}
