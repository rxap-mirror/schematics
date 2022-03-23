import {
  ElementAttribute,
  ElementChild,
  ElementDef,
  ElementExtends,
  ElementRequired,
  ElementTextContent
} from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import {
  AddComponentFakeProvider,
  AddComponentProvider,
  CoerceMethodClass,
  CoerceSourceFile,
  HandleComponent,
  HandleComponentModule,
  ProviderObject,
  ToValueContext
} from '@rxap/schematics-ts-morph';
import { Rule } from '@angular-devkit/schematics';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { join } from 'path';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import { OpenApiRemoteMethodElement } from '@rxap/schematics-xml-parser';
import { AbstractActionButtonElement } from './abstract-action-button.element';

const { dasherize, classify, camelize } = strings;

@ElementDef('adapter')
export class AdapterElement implements ParsedElement {

  public __parent!: EditActionLoaderElement;
  @ElementTextContent()
  @ElementRequired()
  public factoryName!: string;
  @ElementAttribute('import')
  @ElementRequired()
  public importFrom!: string;

  public toValue({ project, options }: ToValueContext): Rule {
    return () => {
    };
  }

}

@ElementDef('loader')
export class EditActionLoaderElement implements ParsedElement<Rule>, HandleComponentModule, HandleComponent {

  public __parent!: AbstractActionButtonElement;

  @ElementChild(OpenApiRemoteMethodElement)
  @ElementRequired()
  public method!: OpenApiRemoteMethodElement;

  @ElementChild(AdapterElement)
  public adapter?: AdapterElement;

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    const loadMethodName = this.method.toValue({ options, sourceFile });
    let loadMethodProvider: ProviderObject = {
      provide: 'ROW_EDIT_LOADER_METHOD',
      useClass: loadMethodName
    };
    const importStructure = [
      {
        moduleSpecifier: '@rxap/material-table-system',
        namedImports: [ 'ROW_EDIT_LOADER_METHOD' ]
      }
    ];
    if (this.adapter) {
      loadMethodProvider = {
        provide: 'ROW_EDIT_LOADER_METHOD',
        useFactory: this.adapter.factoryName,
        deps: [ loadMethodName ]
      };
    }
    if (this.method.mock) {
      const name = this.__parent.__parent.__parent.name;
      const mockClassName = `${CoerceSuffix(classify(name), 'TableEditActionLoader')}FakeMethod`;
      const mockClassFileName = `${CoerceSuffix(dasherize(name), '-table-edit-action-loader')}.fake.method`;
      const methodClassFilePath = join(
        sourceFile.getDirectoryPath(),
        mockClassFileName + '.ts'
      );
      const methodSourceFile = CoerceSourceFile(project, methodClassFilePath);
      CoerceMethodClass(
        methodSourceFile,
        mockClassName,
        {
          structures: [],
          returnType: 'Record<string, any>',
          statements: writer => {
            writer.writeLine('return {} as any');
          }
        }
      );
      AddComponentFakeProvider(
        sourceFile,
        {
          provide: 'ROW_EDIT_LOADER_METHOD',
          useClass: mockClassName
        },
        loadMethodProvider,
        [ 'table', name ].join('.'),
        [
          {
            moduleSpecifier: `./${mockClassFileName}`,
            namedImports: [
              mockClassName
            ]
          },
          ...importStructure
        ]
      );
    } else {
      AddComponentProvider(
        sourceFile,
        loadMethodProvider,
        importStructure,
        options.overwrite
      );
    }
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return () => {
    };
  }

}

@ElementExtends(EditActionLoaderElement)
@ElementDef('mfd-loader')
export class MfdLoaderElement extends EditActionLoaderElement {

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddComponentProvider(
      sourceFile,
      {
        provide: 'ROW_EDIT_LOADER_METHOD',
        useClass: 'RowEditLoaderMethod'
      },
      [
        {
          moduleSpecifier: '@mfd/shared/row-edit-loader.method',
          namedImports: [ 'RowEditLoaderMethod' ]
        },
        {
          moduleSpecifier: '@rxap/material-table-system',
          namedImports: [ 'ROW_EDIT_LOADER_METHOD' ]
        }
      ],
      options.overwrite
    );
    AddComponentProvider(
      sourceFile,
      {
        provide: 'ROW_EDIT_LOADER_SOURCE_METHOD',
        useClass: this.method.toValue({ options, sourceFile })
      },
      [
        {
          moduleSpecifier: '@mfd/shared/row-edit-loader.method',
          namedImports: [ 'ROW_EDIT_LOADER_SOURCE_METHOD' ]
        }
      ],
      options.overwrite
    );
  }

}
