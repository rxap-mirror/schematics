import { ValidatorElement } from './validator.element';
import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { RxapValidatorElement } from './rxap-validator.element';

@ElementExtends(ValidatorElement)
@ElementDef('is-phone-number')
export class IsPhoneNumberElement extends RxapValidatorElement {

  public name = 'IsPhoneNumber';

}
