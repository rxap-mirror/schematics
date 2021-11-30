import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { InputControlElement } from './input-control.element';
import { SelectControlElement } from './select-control.element';
import { TextareaControlElement } from './textarea-control.element';
import { UploadControlElement } from './upload-control.element';
import { ChipListControlElement } from './chip-list-control.element';
import { FormFieldControlElement } from './form-field-control.element';

export const FormFields: Array<Constructor<ParsedElement>> = [
  InputControlElement,
  SelectControlElement,
  TextareaControlElement,
  UploadControlElement,
  ChipListControlElement,
  FormFieldControlElement,
];
