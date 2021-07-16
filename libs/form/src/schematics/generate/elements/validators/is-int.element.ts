import { ValidatorElement } from './validator.element';
import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { RxapValidatorElement } from './rxap-validator.element';

@ElementExtends(ValidatorElement)
@ElementDef('is-int')
export class IsIntElement extends RxapValidatorElement {

  public name = 'IsInt';

}
