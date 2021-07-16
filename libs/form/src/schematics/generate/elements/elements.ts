import { CheckboxControlElement } from './checkbox-control.element';
import { ControlElement } from './control.element';
import { FormElement } from './form.element';
import { GroupControlElement } from './group-control.element';
import { InputControlElement } from './input-control.element';
import {
  DataSourceElement,
  DataSourceTransformerElement,
  OpenApiDataSourceElement,
  SelectControlElement,
  ToOptionsElement,
  ToOptionsFromObjectElement,
  ToOptionsWithObjectElement
} from './select-control.element';
import { ValidatorElements } from './validators/validators';
import { ParsedElement } from '@rxap/xml-parser';
import { Constructor } from '@rxap/utilities';
import { FeatureElements } from './features/features';
import { ArrayControlElement } from './array-control.element';
import { Methods } from '@rxap/schematics-xml-parser';
import { FileControlElement } from './file-control.element';

export const Elements: Array<Constructor<ParsedElement>> = [
  CheckboxControlElement,
  ControlElement,
  FormElement,
  GroupControlElement,
  ArrayControlElement,
  InputControlElement,
  SelectControlElement,
  DataSourceElement,
  OpenApiDataSourceElement,
  DataSourceTransformerElement,
  ToOptionsWithObjectElement,
  ToOptionsElement,
  ToOptionsFromObjectElement,
  FileControlElement,
  ...ValidatorElements,
  ...FeatureElements,
  ...Methods
];
