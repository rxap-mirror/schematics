import { DisplayColumn, FeatureElement } from './feature.element';
import {
  ElementAttribute,
  ElementChild,
  ElementChildTextContent,
  ElementDef,
  ElementExtends,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { Scope, SourceFile } from 'ts-morph';
import { ElementFactory, ParsedElement } from '@rxap/xml-parser';
import { TableElement } from '../table.element';
import { strings } from '@angular-devkit/core';
import { AddComponentProvider, AddNgModuleImport, HandleComponent, ToValueContext } from '@rxap/schematics-ts-morph';
import { GenerateSchema } from '../../schema';
import { MethodElement } from '@rxap/schematics-xml-parser';

const { dasherize, classify, camelize } = strings;

@ElementDef('child')
export class ChildElement implements ParsedElement, HandleComponent {

  public __parent!: TreeTableElement;

  @ElementChild(MethodElement)
  @ElementRequired()
  public method!: MethodElement;

  @ElementAttribute()
  public proxy?: boolean;

  public get proxyMethodFilePath(): string {
    return `tree-table-children-proxy.method`;
  }

  public handleComponent({ sourceFile, project, options }: ToValueContext<GenerateSchema> & { sourceFile: SourceFile }) {
    if (this.proxy) {
      AddComponentProvider(
        sourceFile,
        {
          provide:  'RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_REMOTE_METHOD',
          useClass: 'TreeTableChildrenProxyMethod'
        },
        [
          {
            // TODO : mv RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_REMOTE_METHOD to rxap
            moduleSpecifier: '@mfd/shared/data-sources/tree-table.data-source',
            namedImports:    [ 'RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_REMOTE_METHOD' ]
          },
          {
            moduleSpecifier: `./${this.proxyMethodFilePath}`,
            namedImports:    [ 'TreeTableChildrenProxyMethod' ]
          }
        ],
        options.overwrite
      );
    } else {
      AddComponentProvider(
        sourceFile,
        {
          provide:  'RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_REMOTE_METHOD',
          useClass: this.method.toValue({ sourceFile, project, options })
        },
        [
          {
            // TODO : mv RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_REMOTE_METHOD to rxap
            moduleSpecifier: '@mfd/shared/data-sources/tree-table.data-source',
            namedImports:    [ 'RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_REMOTE_METHOD' ]
          }
        ],
        options.overwrite
      );
    }
  }

  public toValue({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }): any {
    if (this.proxy) {
      if (!project.getSourceFile(this.proxyMethodFilePath + '.ts')) {
        // TODO : replace with generalized proxy method creation from @rxap/remote-method
        const proxyMethodSourceFile = project.createSourceFile(this.proxyMethodFilePath + '.ts');
        const methodName            = this.method.toValue({ sourceFile: proxyMethodSourceFile, project, options });
        proxyMethodSourceFile.addClass({
          name:       'TreeTableChildrenProxyMethod',
          extends:    'ProxyRemoteMethod',
          isExported: true,
          decorators: [
            {
              name:      'Injectable',
              arguments: []
            },
            {
              name:      'RxapRemoteMethod',
              arguments: [ writer => writer.quote(`${dasherize(this.__parent.__parent.id)}-tree-table-children-proxy`) ]
            }
          ],
          ctors:      [
            {
              parameters: [
                {
                  name:       'method',
                  type:       methodName,
                  decorators: [
                    {
                      name:      'Inject',
                      arguments: [ methodName ]
                    }
                  ]
                }
              ],
              statements: [ 'super(method);' ]
            }
          ],
          methods:    [
            {
              name:       'transformParameters',
              isAsync:    true,
              statements: [ 'return node;' ],
              scope:      Scope.Public,
              parameters: [
                {
                  name: 'node',
                  type: 'Node<any>'
                }
              ]
            }
          ]
        });
        proxyMethodSourceFile.addImportDeclarations([
          {
            namedImports:    [ 'Node' ],
            moduleSpecifier: '@rxap/utilities/rxjs'
          },
          {
            namedImports:    [ 'Injectable', 'Inject' ],
            moduleSpecifier: '@angular/core'
          },
          {
            namedImports:    [ 'ProxyRemoteMethod', 'RxapRemoteMethod' ],
            moduleSpecifier: '@rxap/remote-method'
          }
        ]);
      }
    }
  }

}

@ElementDef('root')
export class RootElement implements ParsedElement, HandleComponent {

  public __parent!: TreeTableElement;

  @ElementChild(MethodElement)
  @ElementRequired()
  public method!: MethodElement;

  @ElementAttribute()
  public proxy?: boolean;

  public get proxyMethodFilePath(): string {
    return `tree-table-root-proxy.method`;
  }

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    if (this.proxy) {
      AddComponentProvider(
        sourceFile,
        {
          provide:  'RXAP_TREE_TABLE_DATA_SOURCE_ROOT_REMOTE_METHOD',
          useClass: 'TreeTableRootProxyMethod'
        },
        [
          {
            // TODO : mv RXAP_TREE_TABLE_DATA_SOURCE_ROOT_REMOTE_METHOD to rxap
            moduleSpecifier: '@mfd/shared/data-sources/tree-table.data-source',
            namedImports:    [ 'RXAP_TREE_TABLE_DATA_SOURCE_ROOT_REMOTE_METHOD' ]
          },
          {
            moduleSpecifier: `./${this.proxyMethodFilePath}`,
            namedImports:    [ 'TreeTableRootProxyMethod' ]
          }
        ],
        options.overwrite
      );
    } else {
      AddComponentProvider(
        sourceFile,
        {
          provide:  'RXAP_TREE_TABLE_DATA_SOURCE_ROOT_REMOTE_METHOD',
          useClass: this.method.toValue({ sourceFile, project, options })
        },
        [
          {
            // TODO : mv RXAP_TREE_TABLE_DATA_SOURCE_ROOT_REMOTE_METHOD to rxap
            moduleSpecifier: '@mfd/shared/data-sources/tree-table.data-source',
            namedImports:    [ 'RXAP_TREE_TABLE_DATA_SOURCE_ROOT_REMOTE_METHOD' ]
          }
        ],
        options.overwrite
      );
    }
  }

  public toValue({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }): any {
    if (this.proxy) {
      if (!project.getSourceFile(this.proxyMethodFilePath + '.ts')) {
        // TODO : replace with generalized proxy method creation from @rxap/remote-method
        const proxyMethodSourceFile = project.createSourceFile(this.proxyMethodFilePath + '.ts');
        const methodName            = this.method.toValue({ sourceFile: proxyMethodSourceFile, project, options });
        proxyMethodSourceFile.addClass({
          name:       'TreeTableRootProxyMethod',
          extends:    'ProxyRemoteMethod',
          isExported: true,
          decorators: [
            {
              name:      'Injectable',
              arguments: []
            },
            {
              name:      'RxapRemoteMethod',
              arguments: [ writer => writer.quote(`${dasherize(this.__parent.__parent.id)}-tree-table-root-proxy`) ]
            }
          ],
          ctors:      [
            {
              parameters: [
                {
                  name:       'method',
                  type:       methodName,
                  decorators: [
                    {
                      name:      'Inject',
                      arguments: [ methodName ]
                    }
                  ]
                }
              ],
              statements: [ 'super(method);' ]
            }
          ],
          methods:    [
            {
              name:       'transformParameters',
              isAsync:    true,
              statements: [ 'return node;' ],
              scope:      Scope.Public,
              parameters: [
                {
                  name: 'node',
                  type: 'Node<any>'
                }
              ]
            }
          ]
        });
        proxyMethodSourceFile.addImportDeclarations([
          {
            namedImports:    [ 'Node' ],
            moduleSpecifier: '@rxap/utilities/rxjs'
          },
          {
            namedImports:    [ 'Injectable', 'Inject' ],
            moduleSpecifier: '@angular/core'
          },
          {
            namedImports: [ 'ProxyRemoteMethod', 'RxapRemoteMethod' ],
            moduleSpecifier: '@rxap/remote-method'
          }
        ]);
      }
    }
  }

}

@ElementDef('data-source')
export class DataSourceElement implements ParsedElement<string> {

  public __tag!: string;

  @ElementChildTextContent()
  public name!: string;

  @ElementChildTextContent()
  public id!: string;

  @ElementChildTextContent()
  public from!: string;

  public postParse() {
    if (!this.name && !this.from && this.id) {
      this.name = classify(this.id) + 'DataSource';
    }
  }

  public validate(): boolean {
    return true;
  }

  public toValue({
                   sourceFile,
                   project,
                   options
                 }: ToValueContext<GenerateSchema> & { sourceFile: SourceFile }): string {

    if (!this.from && this.id) {

      const optionsFilePath = `${dasherize(this.id)}.data-source`;

      if (!project.getSourceFile(optionsFilePath + '.ts')) {

        const optionsSourceFile = project.createSourceFile(optionsFilePath + '.ts');

        optionsSourceFile.addClass({
          name: this.name,
          isExported: true,
          extends: 'BaseDataSource<Record<string, unknown>>',
          decorators: [
            {
              name: 'Injectable',
              arguments: []
            },
            {
              name: 'RxapDataSource',
              arguments: [ writer => writer.quote(this.id) ]
            }
          ]
        });

        optionsSourceFile.addImportDeclarations([
          {
            moduleSpecifier: '@angular/core',
            namedImports: [ 'Injectable' ]
          },
          {
            moduleSpecifier: '@rxap/data-source',
            namedImports: [ 'BaseDataSource', 'RxapDataSource' ]
          }
        ]);

      }

      this.from = `./${optionsFilePath}`;

    }

    sourceFile.addImportDeclaration({
      moduleSpecifier: this.from,
      namedImports: [ this.name ]
    });

    return this.name;

  }

}

@ElementExtends(FeatureElement)
@ElementDef('tree-table')
export class TreeTableElement extends FeatureElement {

  public __parent!: TableElement;

  @ElementChild(ChildElement)
  @ElementRequired()
  public child!: ChildElement;

  @ElementChild(RootElement)
  @ElementRequired()
  public root!: RootElement;

  @ElementChild(DataSourceElement)
  public dataSource!: DataSourceElement;

  public postParse() {
    if (!this.dataSource) {
      // TODO : mv TreeTableDataSource to rxap
      this.dataSource = ElementFactory(DataSourceElement, {
        name: 'TreeTableDataSource',
        from: '@mfd/shared/data-sources/tree-table.data-source'
      })
    }
  }

  public handleComponent({
                           sourceFile,
                           project,
                           options
                         }: ToValueContext<GenerateSchema> & { sourceFile: SourceFile }) {
    super.handleComponent({ sourceFile, project, options });
    this.child.handleComponent({ sourceFile, project, options });
    this.root.handleComponent({ sourceFile, project, options });
    AddComponentProvider(
      sourceFile,
      {
        provide: 'TABLE_DATA_SOURCE',
        useClass: this.dataSource.toValue({ sourceFile, project, options })
      },
      [
        {
          namedImports:    [ 'TABLE_DATA_SOURCE' ],
          moduleSpecifier: '@rxap/material-table-system'
        }
      ],
      options.overwrite
    );
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'TreeControlCellComponentModule', '@mfd/shared/tree-control-cell/tree-control-cell.component.module');
    this.child.toValue({ sourceFile, project, options });
    this.root.toValue({ sourceFile, project, options });
  }

  public displayColumn(): DisplayColumn | null {
    return {
      name:   'tree',
      hidden: true
    };
  }

  public columnTemplate(): string {
    return `
    <ng-container matColumnDef="tree" sticky>
      <th *matHeaderCellDef mat-header-cell></th>
      <td *matCellDef="let element" [rxap-tree-control-cell]="element" mat-cell></td>
    </ng-container>
    `;
  }

  public columnTemplateFilter(): string {
    return FeatureElement.ColumnNoFilter('tree', true);
  }

}
