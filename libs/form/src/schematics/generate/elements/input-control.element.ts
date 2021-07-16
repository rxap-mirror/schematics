import { ControlElement, ControlTypeElement } from './control.element';
import { ElementAttribute, ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { ElementFactory } from '@rxap/xml-parser';
import { IsNumberElement } from './validators/is-number.element';
import { IsEmailElement } from './validators/is-email.element';
import { IsUrlElement } from './validators/is-url.element';
import { IsStringElement } from './validators/is-string.element';
import { IsPhoneNumberElement } from './validators/is-phone-number.element';

@ElementExtends(ControlElement)
@ElementDef('input-control')
export class InputControlElement extends ControlElement {

  @ElementAttribute({
    attribute: 'type',
    defaultValue: 'text'
  })
  public inputType?: string;

  public postParse() {
    switch (this.inputType) {

      case 'tel':
        if (!this.validators.some(v => v instanceof IsPhoneNumberElement)) {
          this.validators.push(ElementFactory(IsPhoneNumberElement, {}));
        }
        break;

      case 'email':
        if (!this.validators.some(v => v instanceof IsEmailElement)) {
          this.validators.push(ElementFactory(IsEmailElement, {}));
        }
        break;

      case 'number':
      case 'integer':
        if (!this.validators.some(v => v instanceof IsNumberElement)) {
          this.validators.push(ElementFactory(IsNumberElement, {}));
        }
        break;

      case 'url':
        if (!this.validators.some(v => v instanceof IsUrlElement)) {
          this.validators.push(ElementFactory(IsUrlElement, {}));
        }
        break;

      case 'password':
      case 'text':
        if (!this.validators.some(v => v instanceof IsStringElement)) {
          this.validators.push(ElementFactory(IsStringElement, {}));
        }
        break;

    }
    if (!this.type) {
      switch (this.inputType) {

        case 'checkbox':
        case 'boolean':
          this.type = ElementFactory(ControlTypeElement, { name: 'boolean' });
          break;

        case 'integer':
        case 'number':
          this.type = ElementFactory(ControlTypeElement, { name: 'number' });
          break;

        default:
          this.type = ElementFactory(ControlTypeElement, { name: 'string' });
          break;

      }
    }
  }

}
