import { strings } from '@angular-devkit/core';
import { Rule } from '@angular-devkit/schematics';
import { NodeFactory, WithTemplate } from '@rxap/schematics-html';
import { AddNgModuleImport, HandleComponent, HandleComponentModule, ToValueContext } from '@rxap/schematics-ts-morph';
import { ElementParser, ParsedElement, RxapElement, XmlParserService } from '@rxap/xml-parser';
import { SourceFile } from 'ts-morph';

const { dasherize, classify, camelize, capitalize } = strings;

export function ErrorsElementParser(
  parser: XmlParserService,
  element: RxapElement,
  errorsElement: ErrorsElement = new ErrorsElement(),
): ErrorsElement {

  for (const child of element.getAllChildNodes()) {
    errorsElement.errors[child.nodeName] = child.getTextContent();
  }

  return errorsElement;
}

@ElementParser('errors', ErrorsElementParser)
export class ErrorsElement implements ParsedElement<Rule>, HandleComponent, HandleComponentModule, WithTemplate {

  public errors: Record<string, string> = {};

  public validate(): boolean {
    return Object.keys(this.errors).length !== 0;
  }

  public template(): string {
    let template = '';
    for (const [ error, message ] of Object.entries(this.errors)) {
      template += NodeFactory('mat-error', `*rxapControlError="let error key '${error}'"`, `data-cy="error.${error}"`)(
        '<ng-container i18n>' + message + '</ng-container>'
      );
    }
    return template;
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    AddNgModuleImport(sourceFile, 'ControlErrorDirectiveModule', '@rxap/material-form-system');
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return () => {};
  }

}

