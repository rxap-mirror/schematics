import { ElementChildren, ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { FeatureElement } from './feature.element';
import { strings } from '@angular-devkit/core';
import { Scope, SourceFile } from 'ts-morph';
import {CoerceImports, ToValueContext} from '@rxap/schematics-ts-morph';
import { WithPopoverEditElement } from '../../features/with-popover-edit.element';
import { SchematicsException } from '@angular-devkit/schematics';
import { FormViewElements, NodeElement } from '@rxap/schematics-form';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(FeatureElement)
@ElementDef('popover-edit')
export class PopoverEditElement extends FeatureElement {

  @ElementChildren(NodeElement, { group: 'nodes' })
  public nodes: NodeElement[] = [];

  constructor() {
    super();
    // ensures the form view elements are loaded
    const tmp = FormViewElements;
    if (!tmp) {
      throw new SchematicsException('Could not load the form view elements');
    }
  }

  public get ngTemplateName() {
    return `${this.name}PopoverEdit`;
  }

  public get formValueContainer() {
    return `${this.name}Values`;
  }

  public innerRowTemplate(): string {
    return `
      <ng-template #${this.ngTemplateName}>
        <div>
          <form rxapPopoverEditForm
                matEditLens
                matEditLensClickOutBehavior="noop"
                [initial]="element"
                [(matEditLensPreservedFormValue)]="${this.formValueContainer}.for(element).value">
            <h2 mat-edit-title i18n>${capitalize(this.name)}</h2>
            <div mat-edit-content>
              ${this.getFormTemplate()}
            </div>
            <div mat-edit-actions>
              <button mat-button type="submit">
                <ng-container i18n>Confirm</ng-container>
              </button>
              <button mat-button matEditRevert>
                <ng-container i18n>Revert</ng-container>
              </button>
              <button mat-button matEditClose>
                <ng-container i18n>Close</ng-container>
              </button>
            </div>
          </form>
        </div>
      </ng-template>

      <ng-container>
<span *matRowHoverContent>
  <button mat-icon-button matEditOpen><mat-icon>edit</mat-icon></button>
</span>
      </ng-container>`
  }

  public rowAttributeTemplate(): Array<string | (() => string)> {
    return [
      `[matPopoverEdit]="${this.ngTemplateName}"`
    ];
  }

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    const classDeclaration = sourceFile.getClasses()[0];
    const withPopoverEditElement = this.__parent.__parent.getFeature<WithPopoverEditElement>('with-popover-edit');
    if (!withPopoverEditElement) {
      throw new SchematicsException('The feature element with-popover-edit does not exists in the table features section!');
    }
    if (!classDeclaration.getInstanceMember(this.formValueContainer)) {
      classDeclaration.addProperty({
        name: this.formValueContainer,
        initializer: `new FormValueContainer
        <${withPopoverEditElement.formInterfaceName}, any>()`,
        isReadonly: true,
        scope: Scope.Public,
      });
      CoerceImports(sourceFile,[
        {
          namedImports: [ withPopoverEditElement.formInterfaceName ],
          moduleSpecifier: withPopoverEditElement.formInterfaceModuleSpecifier,
        },
        {
          namedImports: [ 'FormValueContainer' ],
          moduleSpecifier: '@rxap/material-popover-edit'
        }
      ])
    }
    this.nodes?.forEach(node => node.handleComponent({ sourceFile, project, options }));
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    this.nodes?.forEach(node => node.handleComponentModule({ sourceFile, project, options }));
  }

  protected getFormTemplate(): string {
    return this.nodes.map(node => node.template()).join('\n');
  }

}
