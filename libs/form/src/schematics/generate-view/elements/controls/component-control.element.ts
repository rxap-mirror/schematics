import { strings } from '@angular-devkit/core';
import { chain, externalSchematic, Rule } from '@angular-devkit/schematics';
import { NodeFactory } from '@rxap/schematics-html';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import { ElementChildTextContent, ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { join } from 'path';
import { Scope, SourceFile, Writers } from 'ts-morph';
import { GenerateSchema } from '../../schema';
import { NodeElement } from '../node.element';
import { ControlElement } from './control.element';
import { PermissionsElement } from './features/permissions.element';

const { dasherize, classify, capitalize } = strings;

@ElementExtends(NodeElement)
@ElementDef('component-control')
export class ComponentControlElement extends ControlElement {

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

  public template(): string {
    const attributes: Array<string | (() => string)> = [
      `formControlName="${this.name}"`,
      `data-cy="form.${this.controlPath}"`,
    ];
    if (this.hasFeature('permissions')) {
      const permissionsElement =
        this.getFeature<PermissionsElement>('permissions');
      attributes.push(
        ...permissionsElement.getAttributes(
          ['form', this.controlPath].join('.')
        )
      );
    }
    let node = NodeFactory(
      this.selector,
      this.flexTemplateAttribute,
      ...attributes,
      ...this.attributes
    )(`\n<ng-container i18n>${capitalize(this.name)}</ng-container>\n`);
    if (this.hasFeature('permissions')) {
      const permissionsElement =
        this.getFeature<PermissionsElement>('permissions');
      node = permissionsElement.wrapNode(
        node,
        ['form', this.controlPath].join('.')
      );
    }

    return node;
  }

  public handleComponentModule({
    project,
    sourceFile,
    options,
  }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, this.componentModuleName, this.from);
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

              componentSourceFile.addClass({
                name:       this.componentName,
                extends:    'ControlValueAccessor',
                properties: [
                  {
                    name:        'value',
                    scope:       Scope.Public,
                    type:        'any | null',
                    initializer: 'null',
                  },
                ],
                methods:    [
                  {
                    name:       'writeValue',
                    parameters: [
                      {
                        name: 'value',
                        type: 'any | null',
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
