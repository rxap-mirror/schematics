import { FeatureElement } from '../feature.element';
import { ElementChildren, ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { AbstractActionButtonElement, ActionButtonElement } from './action-button.element';
import { SourceFile } from 'ts-morph';
import {
  AddComponentProvider,
  AddNgModuleImport,
  CoerceMethodClass,
  CoerceSourceFile,
  ToValueContext
} from '@rxap/schematics-ts-morph';
import { chain, Rule } from '@angular-devkit/schematics';
import { TableElement } from '../../table.element';
import { ElementFactory } from '@rxap/xml-parser';
import { ColumnElement } from '../../columns/column.element';
import { WithTemplate } from '@rxap/schematics-html';
import { strings } from '@angular-devkit/core';
import { join } from 'path';

const { classify, dasherize } = strings;

export class ControlsColumnElement extends ColumnElement {

  public __tag = 'controls-column';

  protected _name = 'controls';
  public sticky = true;
  public hidden = true;

  public template(): string {
    return `
    <th mat-header-cell mfd-row-controls-header-cell *matHeaderCellDef></th>
    <td mat-cell mfd-row-controls-cell [element]="element" *matCellDef="let element"></td>
    `;
  }

  public templateFilter(): string {
    return `
    <th mat-header-cell *matHeaderCellDef></th>
    `;
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ sourceFile, project, options });
    AddNgModuleImport(sourceFile, 'TableRowControlsModule', '@rxap/material-table-system');
  }

}

export class ActionsColumnElement extends ColumnElement implements WithTemplate {

  public __tag = 'actions-column';
  public sticky = true;
  public hidden = true;
  public actions: ActionButtonElement[] = [];
  protected _name = 'actions';

  public template(): string {
    return [
      '<th mat-header-cell *matHeaderCellDef>',
      ...this.actions.filter(action => action.header).map(action => action.templateHeader()),
      '</th>',
      '<td mat-cell *matCellDef="let element">',
      ...this.actions.map(action => action.template()),
      '</td>'
    ].join('\n')
  }

  public templateFilter(): string {
    return [
      '<th mat-header-cell *matHeaderCellDef>',
      '</th>'
    ].join('\n');
  }

  public handleComponent({ sourceFile, project, options, }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponent({ sourceFile, project, options, });
    const methodName = classify(this.__parent.name) + 'TableRowActionMethod';
    const filename = dasherize(methodName).replace(/-method/, '.method');
    const methodSourceFile = CoerceSourceFile(project, join(sourceFile.getDirectoryPath(), 'methods', filename + '.ts'));
    CoerceMethodClass(methodSourceFile, methodName, {
      returnType: 'any',
      parameterType: '{ element: Data; type: string }',
      typeParameters: [
        {
          name: 'Data',
          constraint: 'Record<string, any>'
        }
      ],
      implements: [ 'TableRowActionMethod<Data>' ],
      structures: [
        {
          namedImports: [ 'TableRowActionMethod' ],
          moduleSpecifier: '@rxap/material-table-system'
        }
      ]
    });
    AddComponentProvider(
      sourceFile,
      {
        provide: 'RXAP_TABLE_ROW_ACTION_METHOD',
        useClass: methodName,
      },
      [
        {
          namedImports: [ methodName ],
          moduleSpecifier: `./methods/${filename}`
        },
        {
          namedImports: [ 'RXAP_TABLE_ROW_ACTION_METHOD' ],
          moduleSpecifier: '@rxap/material-table-system'
        }
      ]
    );
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ sourceFile, project, options });
    AddNgModuleImport(sourceFile, 'TableRowActionsModule', '@rxap/material-table-system');
  }

}

@ElementExtends(FeatureElement)
@ElementDef('actions')
export class ActionButtonsElement extends FeatureElement {

  public __parent!: TableElement;

  @ElementChildren(AbstractActionButtonElement)
  public actions?: AbstractActionButtonElement[];

  public postParse() {
    // TODO : remove deprecated control actions concept
    if (this.actions?.length) {
      if (this.actions.some(action => action.__tag !== 'action')) {
        this.__parent.columns.unshift(ElementFactory(ControlsColumnElement, {}));
      }
      if (this.actions.some(action => action.__tag === 'action')) {
        this.__parent.columns.unshift(ElementFactory(ActionsColumnElement, {
          actions: this.actions.filter(action => action.__tag === 'action') as any,
          __parent: this.__parent,
        }))
      }
    }
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    this.actions?.forEach(action => action.handleComponentModule({ sourceFile, project, options }));
  }

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    this.actions?.forEach(action => action.handleComponent({ sourceFile, project, options }));
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return chain(this.actions?.map(action => action.toValue({ project, options })) ?? []);
  }

}
