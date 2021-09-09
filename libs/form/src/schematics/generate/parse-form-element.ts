import { Tree } from '@angular-devkit/schematics';
import { ParseTemplate } from '@rxap/schematics-xml-parser';
import { Elements } from './elements/elements';
import { FormElement } from './elements/form.element';

export function ParseFormElement(host: Tree, template: string, templateBasePath?: string): FormElement {
  return ParseTemplate<FormElement>(
    host,
    template,
    templateBasePath,
    ...Elements,
  );
}
