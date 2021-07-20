import {
  ElementAttribute,
  ElementChild,
  ElementChildren,
  ElementChildTextContent,
  ElementDef,
  ElementRequired,
} from '@rxap/xml-parser/decorators';
import { ColumnElement } from './columns/column.element';
import { strings } from '@angular-devkit/core';
import { ParsedElement } from '@rxap/xml-parser';
import { Project, SourceFile } from 'ts-morph';
import { FeatureElement } from './features/feature.element';
import { GenerateSchema } from '../schema';
import { AdapterElement } from './adapter.element';
import {
  AddComponentAnimations,
  AddComponentFakeProvider,
  AddComponentInput,
  AddComponentProvider,
  AddDir,
  AddNgModuleImport,
  CoerceMethodClass,
  CoerceSourceFile,
  FindComponentModuleSourceFile,
  FindComponentSourceFile,
  ToValueContext,
} from '@rxap/schematics-ts-morph';
import { FormElement } from '@rxap/schematics-form';
import { chain, Rule } from '@angular-devkit/schematics';
import { join } from 'path';
import { CoerceSuffix } from '@rxap/utilities';
import { NodeFactory, WithTemplate } from '@rxap/schematics-html';
import { MethodElement } from '@rxap/schematics-xml-parser';

const { dasherize, classify, camelize } = strings;

@ElementDef('definition')
export class TableElement implements ParsedElement<Rule> {
  @ElementAttribute()
  public id!: string;

  /**
   * Coerce the id with the 'table' suffix
   */
  public get name(): string {
    const cleanId = dasherize(this.id);
    if (!cleanId.match(/-table$/)) {
      return cleanId + '-table';
    }
    return cleanId;
  }

  @ElementChildTextContent()
  public title?: string;

  @ElementChild(MethodElement)
  public method?: MethodElement;

  @ElementChildren(ColumnElement, { group: 'columns' })
  @ElementRequired()
  public columns!: ColumnElement[];

  @ElementChildren(FeatureElement, { group: 'features' })
  public features?: FeatureElement[];

  @ElementChild(AdapterElement)
  public adapter?: AdapterElement;

  public get tableInterface(): string {
    return 'I' + classify(this.name)
  }

  public get tableInterfaceModuleSpecifier(): string {
    return dasherize(this.name)
  }

  public hasFeature(name: string): boolean {
    return !!this.features?.find((feature) => feature.__tag === name);
  }

  public getFeature<T extends FeatureElement>(name: string): T | undefined {
    return this.features?.find((feature) => feature.__tag === name) as T;
  }

  public get hasFilter(): boolean {
    return this.columns.some((column) => column.filter);
  }

  public validate(): boolean {
    return true;
  }

  public columnsTemplate(): string {
    let template = '<!-- region columns -->';

    if (this.features) {
      for (const feature of this.features) {
        template += feature.columnTemplate();
      }
    }

    for (const column of this.columns) {
      const attributes: Array<string | (() => string)> = [
        `matColumnDef="${column.name}"`,
      ];
      if (column.sticky) {
        attributes.push('sticky');
      }
      template += NodeFactory('ng-container', ...attributes)([column]);
    }

    template += '<!-- endregion -->';
    return template;
  }

  public columnsFilterTemplate(): string {
    if (!this.hasFilter) {
      return '';
    }
    let template = '<!-- region filter columns -->';

    if (this.features) {
      for (const feature of this.features) {
        template += feature.columnTemplateFilter();
      }
    }

    for (const column of this.columns) {
      let innerTemplate = '';
      if (column.filter) {
        innerTemplate += column.templateFilter();
      } else {
        innerTemplate += column.templateNoFiler();
      }
      const attributes: Array<string | (() => string)> = [
        `matColumnDef="filter_${column.name}"`,
      ];
      if (column.sticky) {
        attributes.push('sticky');
      }
      template += NodeFactory('ng-container', ...attributes)(innerTemplate);
    }
    template += '<!-- endregion -->';
    return template;
  }

  public createFormElement(): FormElement {
    const formElement = new FormElement();
    formElement.id = dasherize(this.id) + '-filter';
    formElement.controls = this.columns
      .filter((column) => column.filter)
      .map((column) => column.createControlElement());
    return formElement;
  }

  public footerTemplate(): string {
    let template = '<mat-card-footer>';
    if (this.features) {
      for (const feature of this.features) {
        template += feature.footerTemplate();
      }
    }
    template += '</mat-card-footer>';
    return template;
  }

  public headerTemplate(): string {
    let template =
      '<mat-progress-bar rxapCardProgressBar [loading$]="tableDataSourceDirective.loading$"></mat-progress-bar>';

    if (this.features) {
      for (const feature of this.features) {
        template += feature.headerTemplate();
      }
    }

    if (!this.hasFeature('navigate-back') && this.title) {
      template += `<mat-card-title i18n>${this.title}</mat-card-title>`;
    }

    return template;
  }

  public tableTemplate(): string {
    const attributes: Array<string | (() => string)> = [
      'mat-table',
      '#tableDataSourceDirective="rxapTableDataSource"',
    ];
    if (this.method) {
      attributes.push('rxapTableDataSource');
    } else {
      attributes.push('[rxapTableDataSource]="dataSource"');
    }
    attributes.push('[parameters]="parameters"');
    attributes.push(`id="${this.id}"`);
    if (this.hasFilter) {
      attributes.push('rxap-filter-header-row');
    }
    const nodes: Array<Partial<WithTemplate> | string> | string = [
      this.columnsTemplate(),
      this.columnsFilterTemplate(),
      this.rowTemplate(),
    ];

    if (this.features) {
      attributes.unshift(
        ...this.features.map((feature) => feature.tableTemplate())
      );
    }

    return NodeFactory('table', ...attributes)(nodes);
  }

  public rowTemplate(): string {
    const templates: string[] = [];

    if (this.hasFilter) {
      let filterRowDef =
        '[' +
        this.columns
          .map((column) => column.name)
          .map((name) => `'filter_${name}'`)
          .join(',') +
        ']';
      if (this.hasFeature('column-menu')) {
        filterRowDef = 'rxapTableColumns.displayColumns | toFilterColumnNames';
      }
      templates.push(
        NodeFactory(
          'tr',
          'mat-header-row',
          `*matHeaderRowDef="${filterRowDef}"`
        )()
      );
    }

    let rowDef =
      '[' +
      this.columns
        .map((column) => column.name)
        .map((name) => `'${name}'`)
        .join(',') +
      ']';
    if (this.hasFeature('column-menu')) {
      rowDef = 'rxapTableColumns.displayColumns';
    }
    templates.push(
      NodeFactory('tr', 'mat-header-row', `*matHeaderRowDef="${rowDef}"`)()
    );
    const rowAttributes: Array<string | (() => string)> = [
      '[@rowsAnimation]',
      'mat-row',
      `*matRowDef="let element; columns: ${rowDef};"`,
    ];
    if (this.hasFeature('expandable')) {
      rowAttributes.push('[rxapExpandRow]="element"');
    }
    templates.push(NodeFactory('tr', ...rowAttributes)());
    if (this.hasFeature('expandable')) {
      templates.push(
        NodeFactory(
          'tr',
          'mat-row',
          '*matRowDef="let row; columns: [\'expandedRow\']"',
          'class="rxap-expanded-row"'
        )()
      );
    }

    return templates.join('\n');
  }

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    return chain([
      (tree) => AddDir(tree.getDir(options.path!), project),
      chain(this
        .columns
        .map((column) => column.toValue({ project, options }))),
      chain(this
        .features
        ?.map((node) => node.toValue({ project, options })) ?? []
      ),
      () => this.handleComponent(project, options),
      () => this.handleComponentModule(project, options),
      () => {
        const sourceFile: SourceFile = project.createSourceFile(this.tableInterfaceModuleSpecifier + '.ts', '', { overwrite: true });
        sourceFile.addInterface({
          isExported: true,
          name: this.tableInterface,
          properties: this.columns.filter(column => ![ 'actions-column', 'controls-column' ].includes(column.__tag)).map(column => ({
            name: camelize(column.name),
            type: column.type ? column.type.toValue({ sourceFile }) : 'any',
          }))
        })
      },
    ]);
  }

  private handleComponent(project: Project, options: GenerateSchema) {
    const sourceFile = FindComponentSourceFile(this.name, project);

    // TODO : mv RowAnimation to rxap
    AddComponentAnimations(
      sourceFile,
      'RowAnimation',
      '@rxap/material-table-system'
    );

    if (this.method) {
      if (this.method.mock) {
        const mockClassName = `${CoerceSuffix(
          classify(this.name),
          'Table'
        )}FakeMethod`;
        const mockClassFileName = `${CoerceSuffix(
          dasherize(this.name),
          '-table'
        )}.fake.method`;
        AddComponentFakeProvider(
          sourceFile,
          {
            provide: 'RXAP_TABLE_METHOD',
            useClass: mockClassName,
          },
          {
            provide: 'RXAP_TABLE_METHOD',
            useClass: this.method.toValue({ sourceFile, project, options }),
          },
          ['table', this.name].join('.'),
          [
            {
              moduleSpecifier: `./${mockClassFileName}`,
              namedImports: [mockClassName],
            },
            {
              namedImports: [ 'RXAP_TABLE_METHOD' ],
              moduleSpecifier: '@rxap/material-table-system',
            },
          ],
          options.overwrite
        );
        const methodClassFilePath = join(
          sourceFile.getDirectoryPath(),
          mockClassFileName + '.ts'
        );
        const methodSourceFile = CoerceSourceFile(project, methodClassFilePath);
        CoerceMethodClass(methodSourceFile, mockClassName, {
          structures: [
            {
              namedImports: ['TableEvent'],
              moduleSpecifier: '@rxap/data-source/table',
            },
            {
              namedImports: ['Range'],
              moduleSpecifier: '@rxap/utilities',
            },
          ],
          returnType: 'Array<Record<string, any>>',
          parameterType: 'TableEvent',
          statements: (writer) => {
            writer.writeLine('parameters?.setTotalLength(');
            writer.indent(1);
            writer.writeLine(
              'parameters.page?.pageSize * (parameters.page?.pageIndex + 1) + parameters.page?.pageSize'
            );
            writer.writeLine(');');
            writer.writeLine(
              'return Range.Create(1, parameters.page?.pageSize)'
            );
            writer.indent(1);
            writer.writeLine('.toArray()');
            writer.writeLine('.map(() => ({');
            writer.writeLine('} as any));');
          },
        });
      } else {
        AddComponentProvider(
          sourceFile,
          {
            provide: 'RXAP_TABLE_METHOD',
            useClass: this.method.toValue({ sourceFile, project, options }),
          },
          [
            {
              namedImports: [ 'RXAP_TABLE_METHOD' ],
              moduleSpecifier: '@rxap/material-table-system',
            },
          ],
          options.overwrite
        );
      }
    } else {
      AddComponentInput(
        sourceFile,
        {
          name: 'dataSource',
          type: 'AbstractTableDataSource<any>',
          required: true,
        },
        [
          {
            namedImports: ['AbstractTableDataSource'],
            moduleSpecifier: '@rxap/data-source/table',
          },
        ]
      );
    }
    AddComponentInput(
      sourceFile,
      {
        name: 'parameters',
        type: 'Observable<Record<string, any>>',
        required: false,
      },
      [
        {
          namedImports: ['Observable'],
          moduleSpecifier: 'rxjs',
        },
      ]
    );

    if (this.hasFilter) {
      AddComponentProvider(
        sourceFile,
        {
          provide: 'RXAP_TABLE_FILTER_FORM_DEFINITION',
          useFactory: 'FormFactory',
          deps: ['INJECTOR'],
        },
        [
          {
            namedImports: ['RXAP_TABLE_FILTER_FORM_DEFINITION'],
            moduleSpecifier: '@rxap/material-table-system',
          },
          {
            namedImports: ['FormFactory', 'FormProviders'],
            moduleSpecifier: './form.providers',
          },
          {
            namedImports: ['INJECTOR'],
            moduleSpecifier: '@angular/core',
          },
        ],
        options.overwrite
      );
      AddComponentProvider(
        sourceFile,
        'FormProviders',
        [
          {
            namedImports: ['FormFactory'],
            moduleSpecifier: './form.providers',
          },
        ],
        options.overwrite
      );
      // TODO : move TableFilterService to rxap
      AddComponentProvider(
        sourceFile,
        'TableFilterService',
        [
          {
            namedImports: ['TableFilterService'],
            moduleSpecifier: '@rxap/material-table-system',
          },
        ],
        options.overwrite
      );
    }

    if (this.adapter) {
      this.adapter.handleComponent({ sourceFile, options, project });
    }

    this.features?.forEach((feature) =>
      feature.handleComponent({ sourceFile, project, options })
    );
    this.columns?.forEach((column) =>
      column.handleComponent({ sourceFile, project, options })
    );
  }

  private handleComponentModule(project: Project, options: GenerateSchema) {
    const sourceFile = FindComponentModuleSourceFile(this.name, project);

    // core table modules
    AddNgModuleImport(sourceFile, 'MatCardModule', '@angular/material/card');
    AddNgModuleImport(
      sourceFile,
      'MatProgressBarModule',
      '@angular/material/progress-bar'
    );
    AddNgModuleImport(
      sourceFile,
      'CardProgressBarModule',
      '@rxap/material-directives/card'
    );
    AddNgModuleImport(sourceFile, 'MatTableModule', '@angular/material/table');
    AddNgModuleImport(sourceFile, 'FlexLayoutModule', '@angular/flex-layout');
    AddNgModuleImport(
      sourceFile,
      'TableDataSourceModule',
      '@rxap/material-table-system'
    );

    // filter table modules
    if (this.hasFilter) {
      AddNgModuleImport(
        sourceFile,
        'TableFilterModule',
        '@rxap/material-table-system'
      );
      AddNgModuleImport(sourceFile, 'RxapFormsModule', '@rxap/forms');
      AddNgModuleImport(sourceFile, 'ReactiveFormsModule', '@angular/forms');
    }

    this.features?.forEach((feature) =>
      feature.handleComponentModule({ sourceFile, project, options })
    );
    this.columns?.forEach((column) =>
      column.handleComponentModule({ sourceFile, project, options })
    );
  }
}
