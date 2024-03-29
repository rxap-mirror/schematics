import { Constructor } from '@rxap/schematics-utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { PipeElement } from './pipe.element';

export const PipeElements: Array<Constructor<ParsedElement>> = [
  PipeElement
];
