import { FeatureElement } from '../feature.element';
import {
  ElementChildren,
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { ActionButtonElement } from './action-button.element';
import {
  SourceFile,
  VariableDeclarationKind,
  Writers
} from 'ts-morph';
import {
  AddComponentProvider,
  AddNgModuleImport,
  ToValueContext
} from '@rxap/schematics-ts-morph';
import {
  chain,
  Rule
} from '@angular-devkit/schematics';
import { TableElement } from '../../table.element';
import { ElementFactory } from '@rxap/xml-parser';
import { ColumnElement } from '../../columns/column.element';
import {
  WithTemplate,
  NodeFactory
} from '@rxap/schematics-html';
import { strings } from '@angular-devkit/core';
import { AbstractActionButtonElement } from './abstract-action-button.element';
import { join } from 'path';
import { SelectableElement } from '../selectable.element';

const { classify, dasherize } = strings;

export class ControlsColumnElement extends ColumnElement {

  public __tag = 'controls-column';

  protected _name = 'controls';
  public stickyEnd = true;
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
  public stickyEnd = true;
  public hidden = true;
  public actions: ActionButtonElement[] = [];
  protected _name = 'actions';

  public template(): string {
    const headerAttributes: string[] = [];
    if (this.__parent.getFeature<SelectableElement>('selectable')?.multiple && this.actions.some(action => action.hasHeader && action.if)) {
      headerAttributes.push('*rxapSelectedRows="let selected"')
    }
    return [
      NodeFactory('th', 'mat-header-cell', '*matHeaderCellDef')([
        NodeFactory('div', 'fxLayout="row"', ...headerAttributes)(this.actions.filter(action => action.header).map(action => action.templateHeader()))
      ]),
      NodeFactory('td', 'mat-cell', '*matCellDef="let element"')([
        NodeFactory('div', 'fxLayout="row"')(this.actions.map(action => action.template()))
      ])
    ].join('\n');
  }

  public templateFilter(): string {
    return NodeFactory('th', 'mat-header-cell', '*matHeaderCellDef')();
  }

  public handleComponent({ sourceFile, project, options, }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponent({ sourceFile, project, options, });
    const entrySourceFile: SourceFile = project.createSourceFile(join(sourceFile.getDirectoryPath(), 'methods', 'action', 'index.ts'), '', { overwrite: true });
    entrySourceFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      isExported: true,
      declarations: [
        {
          name: 'TABLE_ROW_ACTION_METHODS',
          initializer: writer => {
            writer.writeLine('[');
            for (const action of this.actions) {
              Writers.object({
                provide: 'RXAP_TABLE_ROW_ACTION_METHOD',
                useClass: action.methodName,
                multi: 'true',
              })(writer);
              writer.write(',');
            }
            writer.write('];');
          }
        }
      ]
    });
    for (const action of this.actions) {
      entrySourceFile.addImportDeclaration({
        namedImports: [ action.methodName ],
        moduleSpecifier: './' + action.methodModuleSpecifier
      })
    }
    entrySourceFile.addImportDeclaration({
      namedImports: [ 'RXAP_TABLE_ROW_ACTION_METHOD' ],
      moduleSpecifier: '@rxap/material-table-system'
    });
    AddComponentProvider(
      sourceFile,
      'TABLE_ROW_ACTION_METHODS',
      [
        {
          namedImports: [ 'TABLE_ROW_ACTION_METHODS' ],
          moduleSpecifier: `./methods/action/index`
        },
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
        this.__parent.columns.push(ElementFactory<ControlsColumnElement>(ControlsColumnElement, {}));
      }
      if (this.actions.some(action => action.__tag === 'action')) {
        this.__parent.columns.push(ElementFactory<ActionsColumnElement>(ActionsColumnElement, {
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
