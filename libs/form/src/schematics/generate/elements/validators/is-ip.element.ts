import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { RxapValidatorElement } from './rxap-validator.element';
import { ValidatorElement } from './validator.element';

@ElementExtends(ValidatorElement)
@ElementDef('is-ip')
export class IsIpElement extends RxapValidatorElement {

  public name = 'IsIP';

}
