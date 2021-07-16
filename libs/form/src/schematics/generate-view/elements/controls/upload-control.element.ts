import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { NodeElement } from '../node.element';
import { ControlElement } from './control.element';
import { NodeFactory } from '@rxap/schematics-html';
import { PermissionsElement } from './features/permissions.element';
import { SourceFile } from 'ts-morph';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { chain, Rule } from '@angular-devkit/schematics';
import { InstallPackageIfNotExists } from '@rxap/schematics-utilities';

@ElementExtends(NodeElement)
@ElementDef('upload-control')
export class UploadControlElement extends ControlElement {

  public template(): string {
    const attributes: Array<string | (() => string)> = [
      `formControlName="${this.name}"`,
    ];
    if (this.hasFeature('permissions')) {
      const permissionsElement =
        this.getFeature<PermissionsElement>('permissions');
      attributes.push(
        ...permissionsElement.getAttributes(
          [ 'form', this.controlPath ].join('.')
        )
      );
    }
    let node = NodeFactory(
      'rxap-upload-button',
      this.flexTemplateAttribute,
      ...attributes,
      ...this.attributes,
    )('');
    if (this.hasFeature('permissions')) {
      const permissionsElement =
        this.getFeature<PermissionsElement>('permissions');
      node = permissionsElement.wrapNode(
        node,
        [ 'form', this.controlPath ].join('.')
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
    AddNgModuleImport(
      sourceFile,
      'UploadButtonComponentModule',
      '@rxap/upload'
    );
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return chain([
      super.toValue({ project, options }),
      InstallPackageIfNotExists('@rxap/upload')
    ]);
  }

}
