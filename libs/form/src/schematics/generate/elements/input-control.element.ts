import { ControlElement } from './control.element';
import { ElementAttribute, ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { ElementFactory } from '@rxap/xml-parser';
import { IsNumberElement } from './validators/is-number.element';
import { IsEmailElement } from './validators/is-email.element';
import { IsUrlElement } from './validators/is-url.element';
import { IsStringElement } from './validators/is-string.element';
import { IsPhoneNumberElement } from './validators/is-phone-number.element';
import { TypeElement } from '@rxap/schematics-xml-parser';

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
          this.validators.push(ElementFactory<IsPhoneNumberElement>(IsPhoneNumberElement, {}));
        }
        break;

      case 'email':
        if (!this.validators.some(v => v instanceof IsEmailElement)) {
          this.validators.push(ElementFactory<IsEmailElement>(IsEmailElement, {}));
        }
        break;

      case 'number':
      case 'integer':
        if (!this.validators.some(v => v instanceof IsNumberElement)) {
          this.validators.push(ElementFactory<IsNumberElement>(IsNumberElement, {}));
        }
        break;

      case 'url':
        if (!this.validators.some(v => v instanceof IsUrlElement)) {
          this.validators.push(ElementFactory<IsUrlElement>(IsUrlElement, {}));
        }
        break;

      case 'password':
      case 'text':
        if (!this.validators.some(v => v instanceof IsStringElement)) {
          this.validators.push(ElementFactory<IsStringElement>(IsStringElement, {}));
        }
        break;

    }
    if (!this.type) {
      switch (this.inputType) {

        case 'checkbox':
        case 'boolean':
          this.type = ElementFactory<TypeElement>(TypeElement, { name: 'boolean' });
          break;

        case 'integer':
        case 'number':
          this.type = ElementFactory<TypeElement>(TypeElement, { name: 'number' });
          break;

        default:
          this.type = ElementFactory<TypeElement>(TypeElement, { name: 'string' });
          break;

      }
    }
  }

}
