import {
  ElementAttribute,
  ElementChild,
  ElementChildTextContent,
  ElementDef,
  ElementExtends,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { Scope, SourceFile } from 'ts-morph';
import { AddComponentProvider, CoerceMethodClass, CoerceSourceFile, ToValueContext } from '@rxap/schematics-ts-morph';
import { chain, noop, Rule } from '@angular-devkit/schematics';
import { NodeFactory } from '@rxap/schematics-html';
import { WindowFormElement } from '../window-form.element';
import { MethodElement, ModuleElement } from '@rxap/schematics-xml-parser';
import { join } from 'path';
import { GenerateSchema } from '../../../schema';
import { strings } from '@angular-devkit/core';
import { AbstractActionButtonElement } from './abstract-action-button.element';

const { dasherize, classify, camelize } = strings;

@ElementExtends(AbstractActionButtonElement)
@ElementDef('action')
export class ActionButtonElement extends AbstractActionButtonElement {

  @ElementChildTextContent()
  @ElementRequired()
  public type!: string;

  @ElementChildTextContent()
  @ElementRequired()
  public icon!: string;

  @ElementChildTextContent()
  public tooltip?: string;

  @ElementAttribute()
  public confirm?: boolean;

  @ElementChildTextContent()
  public errorMessage?: string;

  @ElementChildTextContent()
  public successMessage?: string;

  @ElementChildTextContent()
  public color?: string;

  @ElementAttribute()
  public header?: boolean;

  @ElementChildTextContent()
  public if?: string;

  @ElementChild(WindowFormElement)
  public windowForm?: WindowFormElement;

  @ElementChild(ModuleElement)
  public module?: ModuleElement;

  @ElementChild(MethodElement)
  public method?: MethodElement;

  public get methodName(): string {
    return classify(this.__parent.__parent.name) + classify(this.type) + 'TableRowActionMethod';
  }

  public get methodModuleSpecifier(): string {
    return dasherize(this.methodName).replace(/-method/, '.method')
  }

  public template(): string {
    const attributes: string[] = [
      `rxapTableRowAction="${this.type}"`,
      '[element]="element"',
      'mat-icon-button'
    ];
    if (this.if) {
      attributes.push(`*ngIf="${this.if}"`);
    }
    if (this.color) {
      attributes.push(`color="${this.color}"`);
    }
    if (this.tooltip) {
      attributes.push(`matTooltip="${this.tooltip}"`);
      attributes.push('i18n-matTooltip');
    }
    if (this.confirm) {
      attributes.push('rxapConfirm');
    }
    if (this.errorMessage) {
      attributes.push(`errorMessage="${this.errorMessage}"`);
      attributes.push('i18n-errorMessage');
    }
    if (this.successMessage) {
      attributes.push(`successMessage="${this.successMessage}"`);
      attributes.push('i18n-successMessage');
    }
    return NodeFactory('button', ...attributes)([
      NodeFactory('mat-icon')(this.icon),
      NodeFactory('mat-progress-bar', '*rxapTableRowActionExecuting', 'mode="indeterminate"')()
    ]);
  }

  public templateHeader(): string {
    if (!this.header || this.if) {
      return '';
    }
    const attributes: string[] = [
      `rxapTableRowHeaderAction="${this.type}"`,
      'mat-icon-button'
    ];
    if (this.color) {
      attributes.push(`color="${this.color}"`);
    }
    if (this.tooltip) {
      attributes.push(`matTooltip="${this.tooltip}"`);
      attributes.push('i18n-matTooltip');
    }
    if (this.confirm) {
      attributes.push('rxapConfirm');
    }
    return NodeFactory('button', ...attributes)([
      NodeFactory('mat-icon')(this.icon),
      NodeFactory('mat-progress-bar', '*rxapTableRowActionExecuting', 'mode="indeterminate"')()
    ]);
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponent({ project, options, sourceFile });
    // if a windowForm is used the corresponding FormProvider must be added
    if (this.windowForm) {

      const formProviderName = classify(this.type) + 'RowActionFormProviders';

      AddComponentProvider(
        sourceFile,
        formProviderName,
        [
          {
            moduleSpecifier: `./${join(dasherize(this.windowForm.name!) + '-form', 'form.providers')}`,
            namedImports: [
              {
                name: 'FormProviders',
                alias: formProviderName
              }
            ]
          }
        ],
        options.overwrite
      );

    }
    const methodName = this.methodName;
    const filename = this.methodModuleSpecifier;
    const methodSourceFile = CoerceSourceFile(project, join(sourceFile.getDirectoryPath(), 'methods', 'action', filename + '.ts'));
    CoerceMethodClass(methodSourceFile, methodName, {
      returnType: 'any',
      parameterType: this.__parent.__parent.tableInterface,
      implements: [ `TableRowActionTypeMethod<${this.__parent.__parent.tableInterface}>` ],
      structures: [
        {
          namedImports: [ 'TableRowActionTypeMethod' ],
          moduleSpecifier: '../../table-row-actions/table-row-action.method'
        },
        {
          namedImports: [ 'TableActionMethod' ],
          moduleSpecifier: '../../table-row-actions/decorators'
        },
        {
          namedImports: [ this.__parent.__parent.tableInterface ],
          moduleSpecifier: join('../../', this.__parent.__parent.tableInterfaceModuleSpecifier)
        },
        ...this.windowForm ? [
          {
            namedImports: [ 'Inject' ],
            moduleSpecifier: '@angular/core'
          }
        ] : [],
      ],
      ctors: this.windowForm ? [ {
        parameters: [
          {
            name: 'openFormWindow',
            isReadonly: true,
            scope: Scope.Public,
            type: this.method?.toValue({ project, sourceFile, options }),
            decorators: [
              {
                name: 'Inject',
                arguments: [ this.windowForm.openFormWindowMethodName ]
              }
            ]
          }
        ]
      } ] : [],
      decorators: [
        {
          name: 'TableActionMethod',
          arguments: [ w => w.quote(this.type) ]
        }
      ],
      statements: [
        `console.log(\`action row type: ${this.type}\`, parameters);`,
        ...(this.windowForm ? [
          'return this.openFormWindow.call(parameters);'
        ] : [])
      ]
    });
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    this.module?.handleComponentModule({ project, sourceFile, options });
  }

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    return chain([
      this.windowForm?.toValue({ project, options }) ?? (noop()),
      this.module?.toValue({ project, options }) ?? (noop()),
    ]);
  }

}
