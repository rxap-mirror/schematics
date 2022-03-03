import { strings } from '@angular-devkit/core';
import { chain, noop, Rule } from '@angular-devkit/schematics';
import { NodeFactory } from '@rxap/schematics-html';
import {
  AddComponentProvider,
  AddNgModuleImport,
  CoerceClassMethod,
  CoerceMethodClass,
  CoerceSourceFile,
  GetComponentClass,
  ToValueContext,
} from '@rxap/schematics-ts-morph';
import { MethodElement, ModuleElement } from '@rxap/schematics-xml-parser';
import {
  ElementAttribute,
  ElementChild,
  ElementChildTextContent,
  ElementDef,
  ElementExtends,
  ElementRequired,
} from '@rxap/xml-parser/decorators';
import { IconElement } from '@rxap/xml-parser/elements';
import { join } from 'path';
import { Scope, SourceFile } from 'ts-morph';
import { GenerateSchema } from '../../../schema';
import { SelectableElement } from '../selectable.element';
import { WindowFormElement } from '../window-form.element';
import { AbstractActionButtonElement } from './abstract-action-button.element';

const { dasherize, classify, camelize } = strings;

@ElementExtends(AbstractActionButtonElement)
@ElementDef('action')
export class ActionButtonElement extends AbstractActionButtonElement {

  @ElementChildTextContent()
  @ElementRequired()
  public type!: string;

  @ElementChild(IconElement)
  @ElementRequired()
  public icon!: IconElement;

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

  @ElementAttribute()
  public refresh?: boolean;

  @ElementChildTextContent()
  public permission?: string;

  public get hasHeader() {
    return this.header && this.__parent.__parent.getFeature<SelectableElement>('selectable')?.multiple
  }

  public get showRowHeaderMethodName(): string {
    return `showRowHeaderAction${classify(this.type)}`;
  }

  public get methodName(): string {
    return classify(this.__parent.__parent.name) + classify(this.type) + 'TableRowActionMethod';
  }

  public get methodModuleSpecifier(): string {
    return dasherize(this.methodName).replace(/-method/, '.method')
  }

  public templateHeader(): string {
    if (!this.hasHeader) {
      return '';
    }
    const attributes: string[] = [
      `rxapTableRowHeaderAction="${this.type}"`,
      'mat-icon-button'
    ];
    if (this.color) {
      attributes.push(`color="${this.color}"`);
    }
    if (this.refresh) {
      attributes.push(`[refresh]="true"`)
    }
    if (this.if) {
      attributes.push(`*ngIf="${this.showRowHeaderMethodName}(selected)"`);
    }
    if (this.tooltip) {
      attributes.push(`matTooltip="${this.tooltip}"`);
      attributes.push('i18n-matTooltip');
    }
    if (this.confirm) {
      attributes.push('rxapConfirm');
    }
    if (this.permission) {
      attributes.push(`rxapHasEnablePermission="${this.permission}"`);
    }
    return NodeFactory('button', ...attributes)([
      this.icon.svg ? NodeFactory('mat-icon', `svgIcon="${this.icon.name}"`)() : NodeFactory('mat-icon')(this.icon.name),
      NodeFactory('mat-progress-bar', '*rxapTableRowActionExecuting', 'mode="indeterminate"')()
    ]);
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    this.module?.handleComponentModule({ project, sourceFile, options });
    if (this.confirm) {
      AddNgModuleImport(sourceFile, 'ConfirmComponentModule', '@rxap/components');
    }
    if (this.permission) {
      AddNgModuleImport(sourceFile, 'HasPermissionModule', '@rxap/authorization');
    }
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponent({ project, options, sourceFile });

    if (this.hasHeader && this.if) {

      const componentClass = GetComponentClass(sourceFile);

      CoerceClassMethod(componentClass, this.showRowHeaderMethodName, {
        parameters: [
          {
            name: 'selected',
            type: 'Array<Record<string, any>>',
          },
        ],
        statements: [
          `return selected.some(element => ${this.if});`
        ]
      });

    }

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
          moduleSpecifier: '@rxap/material-table-system'
        },
        {
          namedImports: [ 'TableActionMethod' ],
          moduleSpecifier: '@rxap/material-table-system'
        },
        {
          namedImports: [ this.__parent.__parent.tableInterface ],
          moduleSpecifier: join('../../', this.__parent.__parent.tableInterfaceModuleSpecifier)
        },
        ...this.windowForm ? [
          {
            namedImports: [ 'Inject', 'INJECTOR', 'Injector', 'ChangeDetectorRef' ],
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
          },
          {
            name: 'injector',
            isReadonly: true,
            scope: Scope.Private,
            type: 'Injector',
            decorators: [ {
              name: 'Inject',
              arguments: [ 'INJECTOR' ]
            } ]
          },
          {
            name: 'cdr',
            isReadonly: true,
            scope: Scope.Private,
            type: 'ChangeDetectorRef'
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
        'this.cdr.detectChanges();',
        ...(this.windowForm ? [
          'return this.openFormWindow.call(parameters, { injector: this.injector }).toPromise();'
        ] : [])
      ]
    });
  }

  public template(): string {
    const attributes: string[] = [
      `rxapTableRowAction="${this.type}"`,
      '[element]="element"',
      'mat-icon-button'
    ];
    if (this.refresh) {
      attributes.push(`[refresh]="true"`)
    }
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
    if (this.permission) {
      attributes.push(`rxapHasEnablePermission="${this.permission}"`);
    }
    return NodeFactory('button', ...attributes)([
      this.icon.svg ? NodeFactory('mat-icon', `svgIcon="${this.icon.name}"`)() : NodeFactory('mat-icon')(this.icon.name),
      NodeFactory('mat-progress-bar', '*rxapTableRowActionExecuting', 'mode="indeterminate"')()
    ]);
  }

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    return chain([
      this.windowForm?.toValue({ project, options }) ?? (noop()),
      this.module?.toValue({ project, options }) ?? (noop()),
    ]);
  }

}
