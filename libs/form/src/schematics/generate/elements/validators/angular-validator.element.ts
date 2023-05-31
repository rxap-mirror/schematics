import {
  ValidatorElement,
  ValidatorToValueContext
} from './validator.element';
import {CoerceImports} from "@rxap/schematics-ts-morph";

export class AngularValidatorElement extends ValidatorElement {

  public toValue({ controlOptions, project, options, sourceFile }: ValidatorToValueContext): any {
    CoerceImports(sourceFile,{
      moduleSpecifier: '@angular/forms',
      namedImports:    [ 'Validators' ]
    });
    return super.toValue({ controlOptions, project, options, sourceFile });
  }

}
