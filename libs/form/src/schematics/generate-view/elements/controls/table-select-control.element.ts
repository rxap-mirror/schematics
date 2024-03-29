import {
  ElementChild,
  ElementChildRawContent,
  ElementChildTextContent,
  ElementDef,
  ElementExtends,
  ElementRequired,
} from '@rxap/xml-parser/decorators';
import { ElementFactory, ParsedElement } from '@rxap/xml-parser';
import { Project, Scope, SourceFile, } from 'ts-morph';
import {
  AddComponentProvider,
  AddDependencyInjection,
  AddNgModuleImport,
  ToValueContext,
} from '@rxap/schematics-ts-morph';
import { strings } from '@angular-devkit/core';
import { chain, externalSchematic, Rule } from '@angular-devkit/schematics';
import { join } from 'path';
import { NodeElement } from '../node.element';
import { IconElement, PrefixElement } from './form-field/prefix.element';
import { SelectControlElement } from './form-field/select-control.element';
import { GenerateSchema } from '../../schema';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementDef('table')
export class TableElement implements ParsedElement {
  @ElementChildTextContent()
  public name?: string;

  @ElementChildRawContent()
  public template?: string;

  public postParse() {
    if (!this.template && this.name) {
      this.template = join('views', 'tables', dasherize(this.name) + '.xml');
    }
  }

  public validate(): boolean {
    return !!this.template;
  }
}

@ElementExtends(NodeElement)
@ElementDef('table-select-control')
export class TableSelectControlElement extends SelectControlElement {
  public get openMethodName() {
    return `Open${classify(this.tableSelectName)}TableSelectMethod`;
  }

  public get openMethodFilePath() {
    return `methods/open-${dasherize(
      this.tableSelectName
    )}-table-select.method`;
  }

  public get tableSelectName() {
    return this.controlPath.replace(/\./g, '-');
  }

  @ElementChild(TableElement)
  @ElementRequired()
  public table!: TableElement;

  // TODO : if removed the parser is not executed!!!
  @ElementChildTextContent()
  public compareWith?: string;

  public postParse() {
    super.postParse();
    this.prefix = ElementFactory<PrefixElement>(PrefixElement, {
      button: ElementFactory<IconElement>(IconElement, {
        svg: true,
        name: 'table-eye',
      }),
      attributes: [
        `[rxapOpenTableSelect]="${camelize(this.openMethodName)}"`,
        'rxapStopPropagation',
      ],
    });
  }

  public handleComponent({
    project,
    sourceFile,
    options,
  }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponent({ project, sourceFile, options });
    AddComponentProvider(sourceFile, this.openMethodName);
    AddDependencyInjection(
      sourceFile,
      {
        injectionToken: this.openMethodName,
        parameterName: camelize(this.openMethodName),
      },
      [
        {
          namedImports: [this.openMethodName],
          moduleSpecifier: `./${this.openMethodFilePath}`,
        },
      ]
    );
  }

  public handleComponentModule({
    project,
    sourceFile,
    options,
  }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    // TODO : mv to rxap
    AddNgModuleImport(
      sourceFile,
      'OpenTableSelectDirectiveModule',
      '@rxap/material-table-window-system'
    );
    AddNgModuleImport(
      sourceFile,
      'StopPropagationDirectiveModule',
      '@rxap/directives'
    );
    AddNgModuleImport(
      sourceFile,
      'WindowTableSelectModule',
      '@rxap/material-table-window-system'
    );
    AddNgModuleImport(
      sourceFile,
      `${classify(this.tableSelectName)}TableComponentModule`,
      `./select-tables/${dasherize(this.tableSelectName)}-table/${dasherize(
        this.tableSelectName
      )}-table.component.module`
    );
  }

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    return chain([
      super.toValue({ project, options }),
      () => this.createOpenMethodFile(project),
      externalSchematic('@rxap/schematics-table', 'generate', {
        template: this.table.template,
        name: this.tableSelectName,
        path: join(options.path?.replace(/^\//, '') ?? '', 'select-tables'),
        project: options.project,
        organizeImports: false,
        fixImports: false,
        format: false,
        templateBasePath: options.templateBasePath,
        overwrite: options.overwrite,
        openApiModule: options.openApiModule,
        skipTsFiles: options.skipTsFiles,
      }),
    ]);
  }

  private createOpenMethodFile(project: Project) {
    if (project.getSourceFile(`/${this.openMethodFilePath}.ts`)) {
      return;
    }
    const openMethodSourceFile = project.createSourceFile(
      `/${this.openMethodFilePath}.ts`
    );
    openMethodSourceFile.addImportDeclarations([
      {
        namedImports: [ 'Method' ],
        moduleSpecifier: '@rxap/utilities/rxjs',
      },
      {
        namedImports: ['WindowTableSelectOptions', 'WindowTableSelectService'],
        moduleSpecifier: '@rxap/material-table-window-system',
      },
      {
        namedImports: ['Injectable'],
        moduleSpecifier: '@angular/core',
      },
      {
        namedImports: [classify(this.tableSelectName) + 'TableComponent'],
        moduleSpecifier: `../select-tables/${dasherize(
          this.tableSelectName
        )}-table/${dasherize(this.tableSelectName)}-table.component`,
      },
    ]);
    openMethodSourceFile.addClass({
      isExported: true,
      name: this.openMethodName + '<Data extends Record<string, any> = any>',
      implements: ['Method<Data[], WindowTableSelectOptions<Data>>'],
      decorators: [
        {
          name: 'Injectable',
          arguments: [],
        },
      ],
      ctors: [
        {
          parameters: [
            {
              name: 'windowTableSelect',
              type: 'WindowTableSelectService',
              isReadonly: true,
              scope: Scope.Public,
            },
          ],
        },
      ],
      methods: [
        {
          name: 'call',
          scope: Scope.Public,
          parameters: [
            {
              name: 'options',
              type: 'WindowTableSelectOptions<Data>',
            },
          ],
          returnType: 'Promise<Data[]>',
          statements: [
            `return this.windowTableSelect.open(${classify(
              this.tableSelectName
            )}TableComponent, options);`,
          ],
        },
      ],
    });
  }
}
