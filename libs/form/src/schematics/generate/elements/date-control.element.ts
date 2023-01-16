import { ControlElement } from './control.element';
import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { ElementFactory } from '@rxap/xml-parser';
import { TypeElement } from '@rxap/schematics-xml-parser';

@ElementExtends(ControlElement)
@ElementDef('date-control')
export class DateControlElement extends ControlElement {

  public postParse() {
    if (!this.type) {
      this.type = ElementFactory<TypeElement>(TypeElement, { name: 'Date' });
    }
  }

}
