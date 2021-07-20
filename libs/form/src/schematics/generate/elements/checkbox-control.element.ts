import { ControlElement, } from './control.element';
import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { ElementFactory } from '@rxap/xml-parser';
import { TypeElement } from '@rxap/schematics-xml-parser';

@ElementExtends(ControlElement)
@ElementDef('checkbox-control')
export class CheckboxControlElement extends ControlElement {

  public postParse() {
    if (!this.type) {
      this.type = ElementFactory(TypeElement, { name: 'boolean' });
    }
  }

}
