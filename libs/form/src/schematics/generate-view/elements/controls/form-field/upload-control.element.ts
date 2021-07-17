import { ElementAttribute, ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { NodeElement } from '../../node.element';
import { NodeFactory } from '@rxap/schematics-html';
import { SourceFile } from 'ts-morph';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-ts-morph';
import { chain, Rule } from '@angular-devkit/schematics';
import { InstallPackageIfNotExists } from '@rxap/schematics-utilities';
import { FormFieldElement } from './form-field.element';

@ElementExtends(NodeElement)
@ElementDef('upload-control')
export class UploadControlElement extends FormFieldElement {

  @ElementAttribute({
    defaultValue: '**/**'
  })
  public accept: string = '**/**';

  protected innerTemplate(): string {
    return NodeFactory(
      'rxap-upload-button',
      `formControlName="${this.name}"`,
      'rxapRequired',
      `accept="${this.accept}"`,
      ...this.attributes,
    )('');
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
