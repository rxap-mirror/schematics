import { ElementChild } from '@rxap/xml-parser/decorators';
import { ImportDeclarationStructure, OptionalKind, SourceFile } from 'ts-morph';
import { RouterLinkElement } from '../../router-link.element';
import {
  AddComponentFakeProvider,
  AddComponentProvider,
  CoerceMethodClass,
  CoerceSourceFile,
  ProviderObject,
  ToValueContext
} from '@rxap/schematics-ts-morph';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import { join } from 'path';
import { strings } from '@angular-devkit/core';
import { MethodElement } from '@rxap/schematics-xml-parser';
import { StringOrFactory } from '@rxap/schematics-html';
import { AbstractActionButtonElement } from './abstract-action-button.element';

const { dasherize, classify, camelize } = strings;

export abstract class MethodActionElement extends AbstractActionButtonElement {

  @ElementChild(MethodElement)
  public method?: MethodElement;

  @ElementChild(RouterLinkElement)
  public routerLink?: RouterLinkElement;

  public abstract type: string;

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponent({ sourceFile, project, options });
    const provide                                                           = `ROW_${this.type.toUpperCase()}_METHOD`;
    const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
      {
        namedImports:    [ provide ],
        moduleSpecifier: '@rxap/material-table-system'
      }
    ];
    if (this.method) {
      const providerObject: ProviderObject = {
        provide,
        useClass: this.method.toValue({ sourceFile, project, options })
      };
      if (this.method.mock) {
        const name                = this.__parent.__parent.name;
        const mockClassName       = `${CoerceSuffix(classify(name), `Table${classify(this.type)}Action`)}FakeMethod`;
        const mockClassFileName   = `${CoerceSuffix(dasherize(name), `-table-${dasherize(this.type)}-action`)}.fake.method`;
        const methodClassFilePath = join(
          sourceFile.getDirectoryPath(),
          mockClassFileName + '.ts'
        );
        const methodSourceFile    = CoerceSourceFile(project, methodClassFilePath);
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
            provide,
            useClass: mockClassName
          },
          providerObject,
          [ 'table', name ].join('.'),
          [
            {
              moduleSpecifier: `./${mockClassFileName}`,
              namedImports:    [
                mockClassName
              ]
            },
            ...importStructures
          ]
        );
      } else {
        AddComponentProvider(
          sourceFile,
          providerObject,
          importStructures,
          options.overwrite
        );
      }
    } else if (this.routerLink) {
      AddComponentProvider(
        sourceFile,
        {
          ...this.routerLink.toValue({ sourceFile, project, options, type: this.type }),
          provide
        },
        importStructures,
        options.overwrite
      );
    } else {
      AddComponentProvider(
        sourceFile,
        {
          provide,
          useValue: 'null'
        },
        importStructures,
        options.overwrite
      );
    }
  }

  public template(...attributes: StringOrFactory[]): string {
    return '';
  }

}
