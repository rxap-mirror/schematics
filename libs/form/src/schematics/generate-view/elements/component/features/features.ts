import { Constructor } from '@rxap/schematics-utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { TableComponentFeatureElement } from './table-component-feature.element';

export const ComponentFeatures: Array<Constructor<ParsedElement>> = [
  TableComponentFeatureElement
];
