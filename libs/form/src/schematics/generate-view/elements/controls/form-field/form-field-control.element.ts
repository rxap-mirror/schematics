import { FormFieldElement } from './form-field.element';
import {
  ElementDef,
  ElementExtends,
  ElementChildTextContent
} from '@rxap/xml-parser/decorators';
import { strings } from '@angular-devkit/core';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  ToValueContext,
  AddNgModuleImport
} from '@rxap/schematics-ts-morph';
import {
  SourceFile,
  Scope,
  Writers
} from 'ts-morph';
import { GenerateSchema } from '../../../schema';
import {
  Rule,
  chain,
  externalSchematic
} from '@angular-devkit/schematics';
import { join } from 'path';
import { NodeFactory } from '@rxap/schematics-html';
import { NodeElement } from '../../node.element';

const { dasherize, classify, capitalize } = strings;

@ElementExtends(NodeElement)
@ElementDef('form-field-control')
export class FormFieldControlElement extends FormFieldElement {

  public get componentNameDasherized(): string {
    return dasherize(this.componentName.replace(/Component$/, ''));
  }

  /**
   * The full component name. including the suffix `Component`
   */
  @ElementChildTextContent('name')
  public componentName!: string;

  @ElementChildTextContent()
  public selector!: string;

  @ElementChildTextContent()
  public from!: string;

  public createComponent = false;
  /**
   * The full component module name. including the suffix `Module`
   */
  @ElementChildTextContent('module')
  public componentModuleName!: string;

  public postParse() {
    if (!this.componentName) {
      this.componentName = classify(this.name);
    }
    // normalize the component name to include the ControlComponent suffix
    this.componentName = CoerceSuffix(classify(this.componentName), 'ControlComponent');
    if (!this.from && !this.componentModuleName) {
      this.createComponent = true;
    }
    if (!this.componentModuleName) {
      this.componentModuleName = `${this.componentName}Module`;
    }
    this.componentModuleName = CoerceSuffix(classify(this.componentModuleName), 'Module');
    if (!this.selector) {
      this.selector = `rxap-${this.componentNameDasherized}`;
    }
    if (!this.from) {
      this.from = `./${this.componentNameDasherized}/${this.componentNameDasherized}.component.module`;
    }
  }

  public handleComponentModule({
                                 project,
                                 sourceFile,
                                 options,
                               }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, this.componentModuleName, this.from);
  }

  protected innerTemplate(): string {
    const attributes: Array<string | (() => string)> = [
      `formControlName="${this.name}"`,
      ...this.innerAttributes
    ];
    return NodeFactory(
      this.selector,
      this.flexTemplateAttribute,
      ...attributes,
      ...this.attributes
    )(`\n<ng-container i18n>${capitalize(this.name)}</ng-container>\n`);
  }

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    const rules: Rule[] = [super.toValue({ project, options })];
    if (this.createComponent) {
      rules.push((tree) => {
        const componentModulePath = join(options.path ?? '', this.from + '.ts');
        if (!tree.exists(componentModulePath)) {
          return chain([
            externalSchematic('@rxap/schematics', 'component-module', {
              name:     this.componentNameDasherized,
              path:     options.path?.replace(/^\//, ''),
              selector: this.selector,
              project:  options.project,
            }),
            () => {
              const componentSourceFile = project.createSourceFile(
                `./${this.componentNameDasherized}/${this.componentNameDasherized}.component.ts`,
              );

              const controlType = this.getControl()?.type?.type ?? 'any';

              componentSourceFile.addClass({
                name:       this.componentName,
                extends:    `ControlValueAccessor<${controlType}>`,
                implements: [ `MatFormFieldControl<${controlType}>`],
                properties: [
                  {
                    name:        'value',
                    scope:       Scope.Public,
                    type:        `${controlType} | null`,
                    initializer: 'null',
                  },
                ],
                methods:    [
                  {
                    name:       'writeValue',
                    parameters: [
                      {
                        name: 'value',
                        type: `${controlType} | null`,
                      },
                    ],
                    scope:      Scope.Public,
                    returnType: 'void',
                    statements: ['this.value = value;'],
                  },
                ],
                isExported: true,
                decorators: [
                  {
                    name: 'Component',
                    arguments: [
                      Writers.object({
                        selector:        (w) => w.quote(this.selector),
                        templateUrl:     (w) =>
                                           w.quote(
                                             `./${this.componentNameDasherized}.component.html`,
                                           ),
                        styleUrls:       `[ './${this.componentNameDasherized}.component.scss' ]`,
                        changeDetection: 'ChangeDetectionStrategy.OnPush',
                        host:            Writers.object({
                          class: (w) =>
                                   w.quote(this.selector),
                        }),
                        providers:       (w) => {
                          w.writeLine('[');
                          Writers.object({
                            provide:     'NG_VALUE_ACCESSOR',
                            multi:       'true',
                            useExisting: `forwardRef(() => ${this.componentName})`,
                          })(w);
                          w.write(',')
                          Writers.object({
                            provide: 'MatFormFieldControl',
                            useExisting: `forwardRef(() => ${this.componentName})`,
                          })(w);
                          w.write(']');
                        },
                      }),
                    ],
                  },
                ],
              });

              componentSourceFile.addImportDeclarations([
                {
                  namedImports: ['ControlValueAccessor'],
                  moduleSpecifier: '@rxap/forms',
                },
                {
                  namedImports: ['NG_VALUE_ACCESSOR'],
                  moduleSpecifier: '@angular/forms',
                },
                {
                  namedImports: ['MatFormFieldControl'],
                  moduleSpecifier: '@angular/material/form-field',
                },
                {
                  namedImports: [
                    'Component',
                    'ChangeDetectionStrategy',
                    'forwardRef',
                  ],
                  moduleSpecifier: '@angular/core',
                },
              ]);
            },
          ]);
        } else {
          console.log(
            `The component module '${componentModulePath}' already exists!`
          );
        }
      });
    }
    return chain(rules);
  }

}
