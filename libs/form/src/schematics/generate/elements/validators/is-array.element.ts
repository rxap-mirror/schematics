import { ValidatorElement } from './validator.element';
import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { RxapValidatorElement } from './rxap-validator.element';

@ElementExtends(ValidatorElement)
@ElementDef('is-array')
export class IsArrayElement extends RxapValidatorElement {

  public name = 'IsArray';

}
