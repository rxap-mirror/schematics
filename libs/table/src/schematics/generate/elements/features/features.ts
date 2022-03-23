import { Constructor } from '@rxap/schematics-utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { ActionsButtons } from './action-buttons/actions-buttons';
import { ColumnMenuElement } from './column-menu/column-menu.element';
import { ColumnMenuFeatures } from './column-menu/features';
import { CreateButtonElement } from './create-button.element';
import { ExpandableRowElement } from './expandable-row.element';
import { FeatureElement } from './feature.element';
import { FullTextSearchElement } from './full-text-search.element';
import { NavigateBackElement } from './navigate-back.element';
import { NoColumnHeaderElement } from './no-column-header.element';
import { PaginatorElement } from './paginator.element';
import { SelectableElement } from './selectable.element';
import { SortElement } from './sort.element';
import { SpinnerColumnElement } from './spinner-column.element';
import { TreeTableElement } from './tree-table.element';
import { WithPopoverEditElement } from './with-popover-edit.element';
import { HeaderElement } from './header.element';

export const Features: Array<Constructor<ParsedElement>> = [
  FeatureElement,
  SelectableElement,
  ColumnMenuElement,
  CreateButtonElement,
  NavigateBackElement,
  TreeTableElement,
  PaginatorElement,
  SortElement,
  ExpandableRowElement,
  WithPopoverEditElement,
  FullTextSearchElement,
  SpinnerColumnElement,
  NoColumnHeaderElement,
  HeaderElement,
  ...ActionsButtons,
  ...ColumnMenuFeatures,
];
