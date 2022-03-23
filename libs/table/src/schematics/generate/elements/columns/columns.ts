import { Constructor } from '@rxap/schematics-utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { BooleanColumnElement } from './boolean-column.element';
import { DateColumnElement } from './date-column.element';
import { ColumnElement } from './column.element';
import { Filters } from './filters/filters';
import { LinkColumnElement } from './link-column.element';
import { OptionsColumnElement } from './options-column.element';
import { ComponentColumnElement } from './component-column.element';
import { IconColumnElement } from './icon-column.element';
import { CopyToClipboardColumnElement } from './copy-to-clipboard-column.element';
import { ColumnFeatures } from './features/features';
import { ImageColumnElement } from './image-column.element';
import { PipeElements } from './pipes';

export const Columns: Array<Constructor<ParsedElement>> = [
  BooleanColumnElement,
  DateColumnElement,
  ColumnElement,
  LinkColumnElement,
  OptionsColumnElement,
  ComponentColumnElement,
  IconColumnElement,
  CopyToClipboardColumnElement,
  ImageColumnElement,
  ...PipeElements,
  ...Filters,
  ...ColumnFeatures,
];
