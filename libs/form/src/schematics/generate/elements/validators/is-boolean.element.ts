import { ValidatorElement } from './validator.element';
import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { RxapValidatorElement } from './rxap-validator.element';

@ElementExtends(ValidatorElement)
@ElementDef('is-boolean')
export class IsBooleanElement extends RxapValidatorElement {

  public name = 'IsBoolean';

}
