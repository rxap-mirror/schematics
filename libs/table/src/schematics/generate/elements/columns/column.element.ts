import {
  ElementAttribute,
  ElementChild,
  ElementChildren,
  ElementDef,
  ElementRequired,
} from '@rxap/xml-parser/decorators';
import { FilterElement } from './filters/filter.element';
import { ElementFactory, ParsedElement } from '@rxap/xml-parser';
import { strings } from '@angular-devkit/core';
import { SourceFile } from 'ts-morph';
import { TableElement } from '../table.element';
import { ControlElement } from '@rxap/schematics-form';
import { AddNgModuleImport, HandleComponent, HandleComponentModule, ToValueContext } from '@rxap/schematics-ts-morph';
import { TypeElement } from '@rxap/schematics-xml-parser';
import { chain, Rule } from '@angular-devkit/schematics';
import { GenerateSchema } from '../../schema';
import { DisplayColumn } from '../features/feature.element';
import { FeatureElement } from './features/feature.element';
import { NodeFactory, WithTemplate } from '@rxap/schematics-html';
import { PipeElement } from './pipes/pipe.element';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementDef('column')
export class ColumnElement
  implements ParsedElement<Rule>, HandleComponentModule, HandleComponent {
  public __tag!: string;
  public __parent!: TableElement;

  @ElementAttribute()
  @ElementRequired()
  public set name(value: string) {
    this._name = value;
  }

  public get name(): string {
    return this._name?.replace(/\./g, '-') ?? '';
  }

  /**
   * The row property used from the xml file
   */
  public get rawName(): string {
    return this._name ?? '';
  }

  @ElementChildren(PipeElement, { group: 'pipes' })
  public pipes?: PipeElement[];

  @ElementAttribute()
  public hidden?: boolean;

  @ElementAttribute()
  public active?: boolean;

  @ElementAttribute()
  public sticky?: boolean;

  @ElementChild(FilterElement)
  public filter?: FilterElement;

  @ElementChildren(FeatureElement, { group: 'features' })
  public features?: FeatureElement[];

  @ElementChild(TypeElement)
  public type?: TypeElement;

  protected _name?: string;

  public get valueAccessor(): string {
    // TODO : handle property path segments that match /(^[0-9]+|-|#|\.|@|\/|:|\*)/. Else the template is broken
    return this._name ? '?.' + this._name.split('.').join('?.') : '';
  }

  public displayColumn(): DisplayColumn | DisplayColumn[] | null {
    return {
      name: this.name,
      hidden: this.hidden,
      active: this.active,
    };
  }

  public headerAttributeTemplate(): Array<string | (() => string)> {
    return [
      'mat-header-cell',
      '*matHeaderCellDef',
    ];
  }

  public rowAttributeTemplate(): Array<string | (() => string)> {
    return [
      'mat-cell',
      '*matCellDef="let element"',
    ];
  }

  public pipeTemplate(): string {
    return this.pipes?.map(pipe => ' | ' + pipe.name + pipe.async ? ' | async' : '').join('') ?? '';
  }

  public innerRowTemplate(): Array<Partial<WithTemplate> | string> {
    return [ `{{ element${this.valueAccessor}${this.pipeTemplate()} }}` ]
  }

  public innerHeaderTemplate(): Array<Partial<WithTemplate> | string> {
    return [ '<ng-container i18n>' + capitalize(this.name) + '</ng-container>' ];
  }

  public template(): string {
    const headerAttributes: Array<string | (() => string)> = [
      ...this.headerAttributeTemplate(),
      ...(this.features?.map(feature => feature.headerAttributeTemplate()) ?? []).reduce((a, b) => [ ...a, ...b ], [])
    ];
    const rowAttributes: Array<string | (() => string)> = [
      ...this.rowAttributeTemplate(),
      ...(this.features?.map(feature => feature.rowAttributeTemplate()) ?? []).reduce((a, b) => [ ...a, ...b ], [])
    ];

    if (this.__parent.hasFeature('sort')) {
      headerAttributes.push('mat-sort-header')
    }

    return [
      NodeFactory('th', ...headerAttributes)([
        ...this.innerHeaderTemplate(),
        ...(this.features?.map(feature => feature.innerHeaderTemplate()) ?? [])
      ]),
      NodeFactory('td', ...rowAttributes)([
        ...this.innerRowTemplate(),
        ...(this.features?.map(feature => feature.innerRowTemplate()) ?? [])
      ]),
    ].join('\n');
  }

  public templateFilter(): string {
    return `
    <th mat-header-cell *matHeaderCellDef>
      <mat-form-field rxapNoPadding>
        <mat-label i18n>${capitalize(this.name)}</mat-label>
        <input matInput i18n-placeholder
               placeholder="Enter the ${capitalize(this.name)} filter"
               parentControlContainer formControlName="${camelize(this.name)}">
        <button matSuffix rxapInputClearButton mat-icon-button>
          <mat-icon>clear</mat-icon>
        </button>
      </mat-form-field>
    </th>
    `;
  }

  public templateNoFiler(): string {
    return '<th mat-header-cell *matHeaderCellDef></th>';
  }

  public validate(): boolean {
    return true;
  }

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    return chain(this.features?.map(feature => feature.toValue({ project, options })) ?? []);
  }

  public handleComponentModule({
    sourceFile,
    project,
    options,
  }: ToValueContext & { sourceFile: SourceFile }) {
    if (this.filter) {
      AddNgModuleImport(sourceFile, 'MatIconModule', '@angular/material/icon');
      AddNgModuleImport(
        sourceFile,
        'MatInputModule',
        '@angular/material/input'
      );
      AddNgModuleImport(
        sourceFile,
        'MatButtonModule',
        '@angular/material/button'
      );
      AddNgModuleImport(
        sourceFile,
        'InputClearButtonDirectiveModule',
        '@rxap/material-form-system'
      );
      AddNgModuleImport(
        sourceFile,
        'FormFieldNoPaddingModule',
        '@rxap/material-directives/form-field'
      );
    }
    this.features?.forEach(feature => feature.handleComponentModule({ sourceFile, project, options }));
    this.pipes?.forEach(pipe => pipe.handleComponentModule({ sourceFile, project, options }));
  }

  public handleComponent({
                           sourceFile,
                           project,
                           options,
                         }: ToValueContext & { sourceFile: SourceFile }) {
    this.features?.forEach(feature => feature.handleComponent({ sourceFile, project, options }));
  }

  public createControlElement(): ControlElement {
    if (!this.filter) {
      throw new Error(`The column ${this._name} has not a filter definition.`);
    }
    return ElementFactory(ControlElement, {
      id: camelize(this.name),
      __tag: 'control',
    });
  }
}
